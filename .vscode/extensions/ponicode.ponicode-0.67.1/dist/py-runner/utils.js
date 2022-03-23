"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTmpFile = exports.createTmpFile = void 0;
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const createTmpFile = (sourceFilePath, code, log) => {
    const filePath = path.resolve(path.dirname(sourceFilePath));
    const fileName = `__poni_test_${(0, uuid_1.v4)()}_${path.basename(sourceFilePath)}`;
    try {
        (0, fs_1.writeFileSync)(path.resolve(filePath, fileName), code, { flag: "w+" });
    }
    catch (err) {
        log(`Couldnt create test file for Python Runner in ${filePath}.\nError :`);
        log(err);
        return undefined;
    }
    return { filePath, fileName };
};
exports.createTmpFile = createTmpFile;
const removeTmpFile = (filePath, fileName, log) => {
    try {
        (0, fs_1.unlinkSync)(path.resolve(filePath, fileName));
    }
    catch (err) {
        log(`Couldnt delete test file for Python Runner in ${filePath}.\nError :`);
        log(err);
    }
};
exports.removeTmpFile = removeTmpFile;
//# sourceMappingURL=utils.js.map