import { AnalyticsReporter } from "vscode-extension-analytics";
import { Event as AnalyticsEvent, Exception } from "vscode-extension-analytics";
export { AnalyticsEvent, Exception };
export declare const createReporter: (extensionId: string, extensionVersion: string, apiKey: string) => AnalyticsReporter;
