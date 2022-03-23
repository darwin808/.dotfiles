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
const child_process_1 = require("child_process");
const join = require("lodash/join");
const vscode_1 = require("vscode");
exports.filterGitIgnoredFiles = (uris) => __awaiter(this, void 0, void 0, function* () {
    const workspaceRelativePaths = uris.map(uri => vscode_1.workspace.asRelativePath(uri, false));
    for (const workspaceDirectory of vscode_1.workspace.workspaceFolders) {
        const workspaceDirectoryPath = workspaceDirectory.uri.fsPath;
        try {
            const { stdout, stderr } = yield new Promise((resolve, reject) => {
                child_process_1.exec(`git check-ignore ${workspaceRelativePaths.join(" ")}`, { cwd: workspaceDirectoryPath }, (error, stdout, stderr) => {
                    if (error && (error.code !== 0 && error.code !== 1)) {
                        reject(error);
                        return;
                    }
                    resolve({ stdout, stderr });
                });
            });
            if (stderr) {
                throw new Error(stderr);
            }
            for (const relativePath of stdout.split("\n")) {
                const uri = vscode_1.Uri.file(join(workspaceDirectoryPath, relativePath.slice(1, -1)));
                const index = uris.findIndex(u => u.fsPath === uri.fsPath);
                if (index > -1) {
                    uris.splice(index, 1);
                }
            }
        }
        catch (error) { }
    }
    return uris;
});
//# sourceMappingURL=find.js.map