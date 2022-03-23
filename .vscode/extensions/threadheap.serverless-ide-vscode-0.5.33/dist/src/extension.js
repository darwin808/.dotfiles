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
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const packageJSON = require("../package.json");
const analytics_1 = require("./analytics");
const commands_1 = require("./commands");
const validation_error_dialog_1 = require("./validation-error-dialog");
const find_js_1 = require("./workplace/find.js");
let client;
const analytics = analytics_1.createReporter(`${packageJSON.publisher}.${packageJSON.name}`, packageJSON.version, "936e3290fec1ab6c784fb2a5d06d9d47");
class GenericLanguageServerException extends Error {
    constructor(message, stack) {
        super();
        this.name = "GenericLanguageServerException";
        this.stack = stack;
        this.message = message;
    }
}
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const serverModule = context.asAbsolutePath(path.join("node_modules", "@serverless-ide/language-server", "dist", "server.js"));
        const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
        const serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: vscode_languageclient_1.TransportKind.ipc,
                options: debugOptions
            }
        };
        const yamlFilesWatcher = vscode_1.workspace.createFileSystemWatcher("**/*.{yaml,yml}");
        const clientOptions = {
            documentSelector: [
                { language: "yaml", scheme: "file" },
                { language: "yaml", scheme: "untitled" }
            ],
            synchronize: {
                configurationSection: [
                    "serverlessIDE",
                    "http.proxy",
                    "http.proxyStrictSSL"
                ],
                fileEvents: [yamlFilesWatcher]
            }
        };
        client = new vscode_languageclient_1.LanguageClient("serverless-ide-client", "Serverless IDE: AWS SAM and CloudFormation Support", serverOptions, clientOptions);
        const disposable = client.start();
        const createFileSyncHandler = (action) => (uri) => __awaiter(this, void 0, void 0, function* () {
            const uris = yield find_js_1.filterGitIgnoredFiles([uri]);
            if (uris.length) {
                client.sendNotification(action, uris[0].toString());
            }
        });
        yamlFilesWatcher.onDidCreate(createFileSyncHandler("workplace/oncreate"));
        yamlFilesWatcher.onDidDelete(createFileSyncHandler("workplace/ondelete"));
        yamlFilesWatcher.onDidChange(createFileSyncHandler("workplace/onchanged"));
        client.onReady().then(() => {
            const validationErrorDialog = validation_error_dialog_1.default(context, analytics);
            client.onRequest("workplace/list", (pattern) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const exclude = [
                        ...Object.keys((yield vscode_1.workspace
                            .getConfiguration("search", null)
                            .get("exclude")) || {}),
                        ...Object.keys((yield vscode_1.workspace
                            .getConfiguration("files", null)
                            .get("exclude")) || {})
                    ].join(",");
                    const uris = yield vscode_1.workspace.findFiles(pattern, `{${exclude}}`);
                    return (yield find_js_1.filterGitIgnoredFiles(uris)).map(String);
                }
                catch (error) {
                    analytics.sendException(new analytics_1.Exception(error, {}));
                    return [];
                }
            }));
            client.onRequest("workplace/file", (uri) => __awaiter(this, void 0, void 0, function* () {
                const file = yield vscode_1.workspace.openTextDocument(vscode_1.Uri.parse(uri));
                return file.getText();
            }));
            client.onNotification("custom/analytics", (payload) => {
                // eslint-disable-next-line no-console
                analytics.sendEvent(new analytics_1.AnalyticsEvent(payload.action, payload.attributes));
            });
            client.onNotification("custom/cfn-lint-installation-error", () => {
                validationErrorDialog.showNotification();
            });
            client.onNotification("custom/exception", (payload) => {
                const error = new GenericLanguageServerException(payload.message, payload.stack);
                // eslint-disable-next-line no-console
                console.error("[ServerlessIDE] Unhandled exception in language server: " +
                    error);
                analytics.sendException(new analytics_1.Exception(error, {}));
            });
        });
        context.subscriptions.push(disposable);
        context.subscriptions.push(analytics);
        commands_1.default(context);
        vscode_1.languages.setLanguageConfiguration("yaml", {
            wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/
        });
        yield analytics.sendEvent(new analytics_1.AnalyticsEvent("activated", {}));
    });
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield analytics.sendEvent(new analytics_1.AnalyticsEvent("deactivated", {}));
        if (!client) {
            return undefined;
        }
        analytics.dispose();
        return client.stop();
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map