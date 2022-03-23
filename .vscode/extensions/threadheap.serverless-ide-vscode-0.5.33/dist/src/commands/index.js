"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const vscode = require("vscode");
exports.INSTALL_CFN_LITN = "ServerlessIDE.installCfnLint";
exports.default = (context) => {
    context.subscriptions.push(vscode.commands.registerCommand(exports.INSTALL_CFN_LITN, () => {
        switch (os.platform()) {
            case "darwin": {
                const terminal = vscode.window.createTerminal();
                terminal.show();
                terminal.sendText("brew install cfn-lint\n");
                break;
            }
            case "linux":
            case "win32": {
                const terminal = vscode.window.createTerminal();
                terminal.show();
                terminal.sendText("pip install cfn-lint\n");
                break;
            }
            default:
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://github.com/threadheap/serverless-ide-vscode#settings"));
                break;
        }
    }));
};
//# sourceMappingURL=index.js.map