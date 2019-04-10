"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var convict = require("convict");
exports.default = convict({
    port: {
        default: '3102',
        format: 'port',
        env: 'PORT'
    },
    outputFolder: {
        default: '/../temp/',
        format: String,
        env: 'OUTPUT_FOLDER'
    }
});
//# sourceMappingURL=config.js.map