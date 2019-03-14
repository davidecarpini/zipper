import * as uuid from 'uuid';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as archiver from 'archiver';
import {
  IInputFile,
  TailItemStatus,
  ITailItem,
  IZip,
  tempFolder
} from './types';

class Zipper {

  tail : ITailItem[] = []
  completedZip : IZip[] = []
  errorZip : IZip[] = []

  insert( zipName: string, files : IInputFile[] ): string{
    const token = uuid.v4();
    this.tail.push({
      zipName: zipName,
      serverZipName: `${token}-${zipName}`,
      status: TailItemStatus.WAITING,
      token,
      files: files.map( ({ filename, url }) => ({
        filename,
        serverFilename: `${token}-${filename}`,
        url,
        downloaded: false
      }))
    })
    return token;
  }

  getCompletedZip(token: string){
    return this.completedZip.find( item => item.token == token );
  }

  status( token: string ){
    const item = this.tail.find( item => item.token == token );
    const res: any = {};
    if(item){
      res.index = this.tail.indexOf(item);
      res.status = item.status;
    }else{
      const completedItem = this.completedZip.find( item => item.token == token );
      if(completedItem){
        res.status = TailItemStatus.READY;
      }else{
        res.error = `Can't find zip with token: ${token}`;
      }
    }
    return res;
  }

  setErrorZip(){
    this.completedZip.push({
      token: this.tail[0].token,
      name: this.tail[0].zipName,
      serverName: this.tail[0].serverZipName,
      error: this.tail[0].error
    });
    this.tail.shift();
  }

  async downloadFiles(){
    console.log('...downloading: ', this.tail[0].zipName)
    const promises = [];
    for(const file of this.tail[0].files ){
      const path = `${tempFolder}${file.serverFilename}`;
      const fileStream = fs.createWriteStream(path);
      promises.push(new Promise( (resolve) => {
        const client = file.url.indexOf("https") === 0 ? https: http;
        client.get(file.url, function(response) {
          response.pipe(fileStream);
          fileStream.on('finish', function() {
            fileStream.close();
            file.downloaded = true;
            resolve();
          }).on('error', (err) =>  {
            console.log( err );
            this.tail[0].error = `${err.name}: ${err.message}`;
            this.setErrorZip();
          });
        }).on('error', (err) => {
          console.log( err );
          this.tail[0].error = `${err.name}: ${err.message}`;
          this.setErrorZip();
          fs.unlink(path, () => {});
        });
      }));
    }
    return Promise.all(promises);
  }

  async zipFiles(){
    console.log('...zipping: ', this.tail[0].zipName)
    return new Promise(( resolve ) => {
      const output = fs.createWriteStream( `${tempFolder}${this.tail[0].serverZipName}` );
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });
      output.on('close', () => {
        this.tail[0].size = archive.pointer()
        console.log('COMPLETED: ', this.tail[0].zipName);
        resolve();
      });
      archive.on('error', (err : Error)=> {
        console.log( err );
        this.tail[0].error = `${err.name}: ${err.message}`;
        this.setErrorZip();
      });
      archive.pipe(output);
      for(const file of this.tail[0].files){
        archive.file(`${tempFolder}${file.serverFilename}`, { name: file.filename });
      }
      archive.finalize();
    })
  }

  compute(){
    this.tail[0].status = TailItemStatus.PROCESSING;
    this.downloadFiles().then(() => {
      this.tail[0].status = TailItemStatus.ZIPPING;
      this.zipFiles().then(() => {
        const files = this.tail[0].files;
        files.forEach( file => {
          const path = `${tempFolder}${file.serverFilename}`;
          fs.unlinkSync(path);
        })
        this.completedZip.push({
          token: this.tail[0].token,
          name: this.tail[0].zipName,
          serverName: this.tail[0].serverZipName,
          size: this.tail[0].size,
          error: this.tail[0].error
        });
        this.tail.shift();
      });
    })
  }

  trigger(){
    if (!fs.existsSync(tempFolder)){
      fs.mkdirSync(tempFolder);
    }
    if( this.tail[0] && this.tail[0].status === TailItemStatus.WAITING ){
      console.log('START: ', this.tail[0].zipName)
      this.compute();
    }
  }

}

export default Zipper;
