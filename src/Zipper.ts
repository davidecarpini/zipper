import * as uuid from 'uuid';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as path from 'path';
import {
  IInputFile,
  TailItemStatus,
  ITailItem,
  IZip
} from './types';
const tempFolder = path.join(__dirname,'/../temp/');

class Zipper {

  private tail : ITailItem[] = []
  private completedZip : IZip[] = []

  insert( zipName: string, urls : IInputFile[] ){
    const token = uuid.v4();
    this.tail.push({
      zipName: zipName,
      serverZipName: `${token}-${zipName}`,
      status: TailItemStatus.WAITING,
      token,
      files: urls.map( ({ filename, url }) => ({
        filename,
        serverFilename: `${token}-${filename}`,
        url,
        downloaded: false
      }))
    })
  }

  async downloadFiles(){
    console.log('...downloading')
    const promises = [];
    for(const file of this.tail[0].files ){
      const path = `${tempFolder}${file.serverFilename}`;
      console.log('...creating write stream: ', path);
      const fileStream = fs.createWriteStream(path);
      promises.push(new Promise( (resolve) => {
        console.log( "file.url", file.url );
        const client = file.url.indexOf("https") === 0 ? https: http;
        client.get(file.url, function(response) {
          response.pipe(fileStream);
          fileStream.on('finish', function() {
            fileStream.close();
            file.downloaded = true;
            resolve();
          }).on('error', function(err) {
            console.log( err );
            file.error = `${err.name}: ${err.message}`;
          });
        }).on('error', function(err) {
          console.log( err );
          file.error = `${err.name}: ${err.message}`;
          fs.unlink(path, () => {});
        });
      }));
    }
    return Promise.all(promises);
  }

  async zipFiles(){
    console.log('...zipping')
    return new Promise(( resolve ) => {
      const output = fs.createWriteStream( `${tempFolder}${this.tail[0].serverZipName}` );
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });
      output.on('close', function() {
        console.log('COMPLETED: ' + archive.pointer() + ' total bytes');
        resolve();
      });
      archive.on('error', function(err : Error) {
        console.log( err );
        this.tail[0].error = `${err.name}: ${err.message}`;
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
        this.completedZip.push({
          name: this.tail[0].zipName,
          serverName: this.tail[0].serverZipName,
          error: this.tail[0].error
        });
        this.tail.shift();
      });
    })
  }

  trigger(){
    if( this.tail[0] && this.tail[0].status === TailItemStatus.WAITING ){
      this.compute();
    }
  }

}

export default Zipper;
