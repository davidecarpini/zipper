import * as Koa from 'koa';
import * as fs from 'fs';
import * as path from 'path';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import Zipper from './Zipper';
import { tempFolder } from './types';
import config from './config';

const zipper = new Zipper();
const app = new Koa();
const router = new Router();

setInterval(() => {
  console.log('...checking')
  zipper.trigger();
}, 500)

router
.put('/insert', (ctx: any) => {
  const { host, protocol } = ctx;
  const zipName = ctx.request.body.zipName
  const files = JSON.parse(ctx.request.body.files)
  const token = zipper.insert(zipName, files)
  const basePath : string = ctx.headers['x-base-path'] || '';
  const baseUrl : string = `${protocol}://` + path.normalize(path.join(host, basePath) + '/');
  ctx.body = {
    statusUrl: `${baseUrl}status/${token}`,
    downloadUrl: `${baseUrl}download/${token}`,
  };
});

router.post('/status/:token', (ctx: any) => {
  const { token } = ctx.params;
  ctx.body = zipper.status(token);
});

router.get('/download/:token', (ctx: any) => {
  const { token } = ctx.params;
  const zip = zipper.getCompletedZip(token);
  if(zip){
    ctx.body = fs.createReadStream(`${tempFolder}${zip.serverName}`);
    ctx.set('Content-disposition', 'attachment; filename=' + zip.name);
    const mimetype = 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip';
    ctx.set('Content-type', mimetype);
  }else{
    ctx.body = { error: `Can't find completed zip for token: ${token}` }
  }
});

router.get('/admin/monitor', (ctx: any) => {
  ctx.body = `
    <DOCTYPE html>
    <html>
      <head>
        <style>
          table {
            margin: 20px;
            border: 1px solid black;
            border-collapse: collapse;
          }
          th, td{
            border: 1px solid black;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h3>Tail</h3>
        <table>
          <thead>
            <tr>
              <th>token</th>
              <th>name</th>
              <th>status</th>
              <th>error</th>
            </tr>
          </thead>
          <tbody>
          ${
            zipper.tail.length > 0 ? zipper.tail.map( item => (`
              <tr>
                <td>${item.token}</td>
                <td>${item.zipName}</td>
                <td>${item.status}</td>
                <td>${item.error || ''}</td>
              </tr>
            `)).join(''):
            `<tr><td colSpan='4'>Empty Tail</td></tr>`
          }
          </tbody>
        </table>
        <h3>Completed</h3>
        <table>
          <thead>
            <tr>
              <th>token</th>
              <th>name</th>
              <th>size</th>
              <th>error</th>
            </tr>
          </thead>
          <tbody>
          ${
            zipper.completedZip.length > 0 ? zipper.completedZip.map( item => (`
              <tr>
                <td>${item.token}</td>
                <td>${item.name}</td>
                <td>${item.size}</td>
                <td>${item.error || ''}</td>
              </tr>
            `)).join(''):
            `<tr><td colSpan='3'>Empty Completed</td></tr>`
          }
          </tbody>
        </table>
        <h3>Errors</h3>
        <table>
          <thead>
            <tr>
              <th>token</th>
              <th>name</th>
              <th>error</th>
            </tr>
          </thead>
          <tbody>
          ${
            zipper.errorZip.length > 0 ? zipper.errorZip.map( item => (`
              <tr>
                <td>${item.token}</td>
                <td>${item.name}</td>
                <td>${item.error || ''}</td>
              </tr>
            `)).join(''):
            `<tr><td colSpan='3'>Empty Error</td></tr>`
          }
          </tbody>
        </table>
      </body>
    </html>
  `
})

app
.use(bodyParser())
.use(router.routes())
.use(router.allowedMethods())
.listen(config.get('port'));
