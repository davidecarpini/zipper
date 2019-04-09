"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var config_1 = require("./config");
var TailItemStatus;
(function (TailItemStatus) {
    TailItemStatus["WAITING"] = "WAITING";
    TailItemStatus["PROCESSING"] = "PROCESSING";
    TailItemStatus["ZIPPING"] = "ZIPPING";
    TailItemStatus["READY"] = "READY";
})(TailItemStatus = exports.TailItemStatus || (exports.TailItemStatus = {}));
exports.tempFolder = path.join(__dirname, config_1.default.get('outputFolder'));
//# sourceMappingURL=types.js.map