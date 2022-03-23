import * as vscode from "vscode";
import { AnalyticsReporter } from "vscode-extension-analytics";
export declare class CfnValidationMessage {
    private context;
    private analytics;
    private isVisible;
    constructor(context: vscode.ExtensionContext, analytics: AnalyticsReporter);
    showNotification(): Promise<void>;
    private onYesAnswer;
    private onLearnMore;
}
declare const _default: (context: vscode.ExtensionContext, analytics: AnalyticsReporter) => CfnValidationMessage;
export default _default;
