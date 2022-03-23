import * as vscode from "vscode";
export declare class Settings {
    readonly prefix: string;
    constructor(prefix: string);
    get<T>(key: string, defaultValue?: T): T | undefined;
    set<T>(key: string, value: T, target: vscode.ConfigurationTarget): Promise<void>;
}
declare const _default: Settings;
export default _default;
