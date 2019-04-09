"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var http = require("http");
var https = require("https");
var fs = require("fs");
var archiver = require("archiver");
var types_1 = require("./types");
var Zipper = /** @class */ (function () {
    function Zipper() {
        this.tail = [];
        this.completedZip = [];
        this.errorZip = [];
    }
    Zipper.prototype.insert = function (zipName, files) {
        var token = uuid.v4();
        this.tail.push({
            zipName: zipName,
            serverZipName: token + "-" + zipName,
            status: types_1.TailItemStatus.WAITING,
            token: token,
            files: files.map(function (_a) {
                var filename = _a.filename, url = _a.url;
                return ({
                    filename: filename,
                    serverFilename: token + "-" + filename,
                    url: url,
                    downloaded: false
                });
            })
        });
        return token;
    };
    Zipper.prototype.getCompletedZip = function (token) {
        return this.completedZip.find(function (item) { return item.token == token; });
    };
    Zipper.prototype.status = function (token) {
        var item = this.tail.find(function (item) { return item.token == token; });
        var res = {};
        if (item) {
            res.index = this.tail.indexOf(item);
            res.status = item.status;
        }
        else {
            var completedItem = this.completedZip.find(function (item) { return item.token == token; });
            if (completedItem) {
                res.status = types_1.TailItemStatus.READY;
            }
            else {
                res.error = "Can't find zip with token: " + token;
            }
        }
        return res;
    };
    Zipper.prototype.setErrorZip = function () {
        this.completedZip.push({
            token: this.tail[0].token,
            name: this.tail[0].zipName,
            serverName: this.tail[0].serverZipName,
            error: this.tail[0].error
        });
        this.tail.shift();
    };
    Zipper.prototype.downloadFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _loop_1, _i, _a, file;
            var _this = this;
            return __generator(this, function (_b) {
                console.log('...downloading: ', this.tail[0].zipName);
                promises = [];
                _loop_1 = function (file) {
                    var path = "" + types_1.tempFolder + file.serverFilename;
                    var fileStream = fs.createWriteStream(path);
                    promises.push(new Promise(function (resolve) {
                        var client = file.url.indexOf("https") === 0 ? https : http;
                        client.get(file.url, function (response) {
                            var _this = this;
                            response.pipe(fileStream);
                            fileStream.on('finish', function () {
                                fileStream.close();
                                file.downloaded = true;
                                resolve();
                            }).on('error', function (err) {
                                console.log(err);
                                _this.tail[0].error = err.name + ": " + err.message;
                                _this.setErrorZip();
                            });
                        }).on('error', function (err) {
                            console.log(err);
                            _this.tail[0].error = err.name + ": " + err.message;
                            _this.setErrorZip();
                            fs.unlink(path, function () { });
                        });
                    }));
                };
                for (_i = 0, _a = this.tail[0].files; _i < _a.length; _i++) {
                    file = _a[_i];
                    _loop_1(file);
                }
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    Zipper.prototype.zipFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('...zipping: ', this.tail[0].zipName);
                return [2 /*return*/, new Promise(function (resolve) {
                        var output = fs.createWriteStream("" + types_1.tempFolder + _this.tail[0].serverZipName);
                        var archive = archiver('zip', {
                            zlib: { level: 9 } // Sets the compression level.
                        });
                        output.on('close', function () {
                            _this.tail[0].size = archive.pointer();
                            console.log('COMPLETED: ', _this.tail[0].zipName);
                            resolve();
                        });
                        archive.on('error', function (err) {
                            console.log(err);
                            _this.tail[0].error = err.name + ": " + err.message;
                            _this.setErrorZip();
                        });
                        archive.pipe(output);
                        for (var _i = 0, _a = _this.tail[0].files; _i < _a.length; _i++) {
                            var file = _a[_i];
                            archive.file("" + types_1.tempFolder + file.serverFilename, { name: file.filename });
                        }
                        archive.finalize();
                    })];
            });
        });
    };
    Zipper.prototype.compute = function () {
        var _this = this;
        this.tail[0].status = types_1.TailItemStatus.PROCESSING;
        this.downloadFiles().then(function () {
            _this.tail[0].status = types_1.TailItemStatus.ZIPPING;
            _this.zipFiles().then(function () {
                var files = _this.tail[0].files;
                files.forEach(function (file) {
                    var path = "" + types_1.tempFolder + file.serverFilename;
                });
                _this.completedZip.push({
                    token: _this.tail[0].token,
                    name: _this.tail[0].zipName,
                    serverName: _this.tail[0].serverZipName,
                    size: _this.tail[0].size,
                    error: _this.tail[0].error
                });
                _this.tail.shift();
            });
        });
    };
    Zipper.prototype.trigger = function () {
        if (!fs.existsSync(types_1.tempFolder)) {
            fs.mkdirSync(types_1.tempFolder);
        }
        if (this.tail[0] && this.tail[0].status === types_1.TailItemStatus.WAITING) {
            console.log('START: ', this.tail[0].zipName);
            this.compute();
        }
    };
    return Zipper;
}());
exports.default = Zipper;
//# sourceMappingURL=Zipper.js.map