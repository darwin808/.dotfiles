import { InputValue } from "@ponicode/lolita/lib/types/python/definition";
export interface SourceFilePayload {
    path: string;
    function: string;
    class: string | undefined;
}
export interface TestFilePayload {
    code: string;
    className: string;
    test?: string;
}
/**
 * Payload sent to the class PyRunner
 */
export interface Payload {
    sourceFile: SourceFilePayload;
    testFile: TestFilePayload;
    cwd: string;
}
/**
 * Payload sent directly to the .py runner
 */
export interface PYPayload {
    sourceFile: SourceFilePayload;
    testFile: {
        path: string;
        className: string;
    };
    id: number;
    cwd: string;
}
export declare type PyReport = PyReportSuccess | PyReportFailure;
export interface PyReportFailure {
    success: false;
    result: string | undefined;
    id: number;
}
export interface PyReportSuccess {
    success: true;
    result: Array<PyResult>;
    id: number;
}
export interface PyResult {
    expect: PyRunnerExpect;
    pytest_data: PyRunnerTest;
}
export interface PyRunnerExpect {
    inputs: PyRunnerInputs;
    outputs: PyRunnerOutputs;
}
export interface PyRunnerInputs {
    args: Array<{
        value: InputValue | "<unsupported>";
        modified: boolean;
    }>;
    kwargs: Array<{
        key: string;
        value: InputValue;
        modified: boolean;
    }>;
}
export declare type PyRunnerOutputs = PyRunnerOutputsThrow | PyRunnerOutputsSuccess;
export interface PyRunnerOutputsBase {
    expect: PyRunnerInputs;
    error: boolean;
}
export interface PyRunnerOutputsSuccess extends PyRunnerOutputsBase {
    return: InputValue;
    error: false;
}
export interface PyRunnerOutputsThrow extends PyRunnerOutputsBase {
    throw: {
        type: string;
        args: string;
        message: string;
    };
    error: true;
}
export interface PyRunnerTest {
    outcome: PyRunnerOutcome;
    nodeid: string;
    duration: number;
    keywords: Record<string, number>;
    sections: Array<any>;
    longreprtext: string;
    stderr: string;
    stdout: string;
}
export declare type PyRunnerOutcome = "passed" | "failed";
export declare type PyRunnerOperation = PyRunnerOperationSuccess | PyRunnerOperationFailed;
export interface PyRunnerOperationSuccess {
    duration: number;
    outcome: PyRunnerOutcome;
}
export interface PyRunnerOperationFailed extends PyRunnerOperationSuccess {
    crash: PyRunnerCrash;
    traceback: Array<PyRunnerCrash>;
}
export interface PyRunnerCrash {
    path: string;
    lineno: number;
    message: string;
    stderr: string;
    longrepr: string;
}
//# sourceMappingURL=types.d.ts.map