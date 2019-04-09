"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Koa = require("koa");
var fs = require("fs");
var path = require("path");
var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
var Zipper_1 = require("./Zipper");
var types_1 = require("./types");
var config_1 = require("./config");
var cors = require('@koa/cors');
var zipper = new Zipper_1.default();
var app = new Koa();
var router = new Router();
setInterval(function () {
    console.log('...checking');
    zipper.trigger();
}, 500);
router
    .put('/insert', function (ctx) {
    var host = ctx.host, protocol = ctx.protocol;
    console.log("ctx.request.body", ctx.request.body);
    var body = ctx.request.body;
    var zipName = body.zipName;
    var files = body.files;
    var token = zipper.insert(zipName, files);
    var basePath = ctx.headers['x-base-path'] || '';
    var baseUrl = protocol + "://" + path.normalize(path.join(host, basePath) + '/');
    ctx.body = {
        statusUrl: baseUrl + "status/" + token,
        downloadUrl: baseUrl + "download/" + token,
        index: zipper.tail.length - 1
    };
});
router.post('/status/:token', function (ctx) {
    var token = ctx.params.token;
    ctx.body = zipper.status(token);
});
router.get('/download/:token', function (ctx) {
    var token = ctx.params.token;
    var zip = zipper.getCompletedZip(token);
    if (zip) {
        ctx.body = fs.createReadStream("" + types_1.tempFolder + zip.serverName);
        ctx.set('Content-disposition', 'attachment; filename=' + zip.name);
        var mimetype = 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip';
        ctx.set('Content-type', mimetype);
    }
    else {
        ctx.body = { error: "Can't find completed zip for token: " + token };
    }
});
router.get('/admin/monitor', function (ctx) {
    ctx.body = "\n    <DOCTYPE html>\n    <html>\n      <head>\n        <style>\n          table {\n            margin: 20px;\n            border: 1px solid black;\n            border-collapse: collapse;\n          }\n          th, td{\n            border: 1px solid black;\n            text-align: left;\n          }\n        </style>\n      </head>\n      <body>\n        <h3>Tail</h3>\n        <table>\n          <thead>\n            <tr>\n              <th>token</th>\n              <th>name</th>\n              <th>status</th>\n              <th>error</th>\n            </tr>\n          </thead>\n          <tbody>\n          " + (zipper.tail.length > 0 ? zipper.tail.map(function (item) { return ("\n              <tr>\n                <td>" + item.token + "</td>\n                <td>" + item.zipName + "</td>\n                <td>" + item.status + "</td>\n                <td>" + (item.error || '') + "</td>\n              </tr>\n            "); }).join('') :
        "<tr><td colSpan='4'>Empty Tail</td></tr>") + "\n          </tbody>\n        </table>\n        <h3>Completed</h3>\n        <table>\n          <thead>\n            <tr>\n              <th>token</th>\n              <th>name</th>\n              <th>size</th>\n              <th>error</th>\n            </tr>\n          </thead>\n          <tbody>\n          " + (zipper.completedZip.length > 0 ? zipper.completedZip.map(function (item) { return ("\n              <tr>\n                <td>" + item.token + "</td>\n                <td>" + item.name + "</td>\n                <td>" + item.size + "</td>\n                <td>" + (item.error || '') + "</td>\n              </tr>\n            "); }).join('') :
        "<tr><td colSpan='3'>Empty Completed</td></tr>") + "\n          </tbody>\n        </table>\n        <h3>Errors</h3>\n        <table>\n          <thead>\n            <tr>\n              <th>token</th>\n              <th>name</th>\n              <th>error</th>\n            </tr>\n          </thead>\n          <tbody>\n          " + (zipper.errorZip.length > 0 ? zipper.errorZip.map(function (item) { return ("\n              <tr>\n                <td>" + item.token + "</td>\n                <td>" + item.name + "</td>\n                <td>" + (item.error || '') + "</td>\n              </tr>\n            "); }).join('') :
        "<tr><td colSpan='3'>Empty Error</td></tr>") + "\n          </tbody>\n        </table>\n      </body>\n    </html>\n  ";
});
app
    .use(cors())
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(config_1.default.get('port'));
//# sourceMappingURL=index.js.map