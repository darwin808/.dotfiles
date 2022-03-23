"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Settings {
    constructor(prefix) {
        this.prefix = prefix;
    }
    get(key, defaultValue) {
        // tslint:disable-next-line:no-null-keyword
        const settings = vscode.workspace.getConfiguration(this.prefix, null);
        if (settings) {
            const val = settings.get(key);
            if (val) {
                return val;
            }
        }
        return defaultValue || undefined;
    }
    set(key, value, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = vscode.workspace.getConfiguration(this.prefix, null);
            yield settings.update(key, value, target);
        });
    }
}
exports.Settings = Settings;
exports.default = new Settings("serverlessIDE");
//# sourceMappingURL=index.js.map