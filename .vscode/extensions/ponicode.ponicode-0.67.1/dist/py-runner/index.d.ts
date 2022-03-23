import { PythonShell } from "python-shell";
import { DeferredPromise } from "@ponicode/misc";
import * as RunnerTypes from "./types";
declare class PyRunner {
    static pyshell: PythonShell | undefined;
    static onError: (e: any) => void;
    static onInfo: (i: any) => void;
    static pythonPath: string;
    static promises: Record<number, DeferredPromise<RunnerTypes.PyReport>>;
    payload?: RunnerTypes.Payload;
    testFilePath?: string;
    testFileName?: string;
    static init(entryPath: string, pythonPath?: string): void;
    sendJSON(path: string, id: number): void;
    runTest(payload: RunnerTypes.Payload): Promise<RunnerTypes.PyReport>;
}
export { PyRunner, RunnerTypes };
//# sourceMappingURL=index.d.ts.map