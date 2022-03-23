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
const os = require("os");
const vscode = require("vscode");
const nls = require("vscode-nls");
const analytics_1 = require("../analytics");
const commands_1 = require("../commands");
const localize = nls.loadMessageBundle();
const MISSING_CFN_LINT_MESSAGE = `
cfn-lint is not installed or could not be found in $PATH
`;
const RESPONSE_YES = "Install now";
const RESPONSE_LEARN_MORE = "Learn more";
const SUPPORTED_PLATFORMS = ["darwin", "linux", "win32"];
class CfnValidationMessage {
    constructor(context, analytics) {
        this.isVisible = false;
        this.context = context;
        this.analytics = analytics;
    }
    showNotification() {
        return __awaiter(this, void 0, void 0, function* () {
            this.analytics.sendEvent(new analytics_1.AnalyticsEvent("cfnLintErrorDialogShown", {
                isVisible: this.isVisible.toString()
            }));
            if (this.isVisible) {
                return;
            }
            this.isVisible = true;
            const notificationMessage = localize("ServerlessIDE.validation.missingCfnLintMessage", MISSING_CFN_LINT_MESSAGE);
            return vscode.window
                .showWarningMessage(notificationMessage, RESPONSE_YES, RESPONSE_LEARN_MORE)
                .then((response) => {
                switch (response) {
                    case RESPONSE_YES: {
                        this.onYesAnswer();
                        break;
                    }
                    case RESPONSE_LEARN_MORE:
                        this.onLearnMore();
                        break;
                    default: {
                        this.analytics.sendEvent(new analytics_1.AnalyticsEvent("cfnLintErrorDialogDismissed", {}));
                    }
                }
                this.isVisible = false;
            });
        });
    }
    onYesAnswer() {
        this.analytics.sendEvent(new analytics_1.AnalyticsEvent("cfnLintErrorDialogYesAnswered", {}));
        if (SUPPORTED_PLATFORMS.includes(os.platform())) {
            vscode.commands.executeCommand(commands_1.INSTALL_CFN_LITN);
        }
        else {
            vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://github.com/aws-cloudformation/cfn-python-lint#install"));
        }
    }
    onLearnMore() {
        this.analytics.sendEvent(new analytics_1.AnalyticsEvent("cfnLintErrorDialogLearnMoreAnswered", {}));
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://github.com/threadheap/serverless-ide-vscode#settings"));
    }
}
exports.CfnValidationMessage = CfnValidationMessage;
exports.default = (context, analytics) => {
    return new CfnValidationMessage(context, analytics);
};
//# sourceMappingURL=index.js.map