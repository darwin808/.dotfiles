"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerTypes = exports.PyRunner = void 0;
const assert_1 = __importDefault(require("assert"));
const path = __importStar(require("path"));
const python_shell_1 = require("python-shell");
const misc_1 = require("@ponicode/misc");
const RunnerTypes = __importStar(require("./types"));
exports.RunnerTypes = RunnerTypes;
const utils_1 = require("./utils");
class PyRunner {
    static init(entryPath, pythonPath) {
        if (!pythonPath) {
            console.warn("[WARNING] Python path is not defined : we use the default PATH python");
        }
        PyRunner.onInfo("Creating Python Shell");
        PyRunner.pythonPath = pythonPath !== null && pythonPath !== void 0 ? pythonPath : "python3";
        PyRunner.pyshell = new python_shell_1.PythonShell(entryPath, {
            pythonPath: PyRunner.pythonPath,
            env: { PYTHONDONTWRITEBYTECODE: "1" }, // This environment variable is needed, otherwise when running the Python runner, useless files are generated
        });
        PyRunner.pyshell.on("error", PyRunner.onError);
        PyRunner.pyshell.on("stderr", PyRunner.onError);
        PyRunner.pyshell.on("close", PyRunner.onError);
        PyRunner.pyshell.on("message", (message) => {
            PyRunner.onInfo("Raw result from runner.py ->");
            PyRunner.onInfo(message);
            const result = JSON.parse(message);
            const promise = PyRunner.promises[result.id];
            promise.resolve(result);
        });
        PyRunner.promises = {};
        PyRunner.onInfo("PyShell is initiated");
    }
    sendJSON(path, id) {
        if (!this.payload) {
            throw new Error("Payload is not defined in Python Runner");
        }
        if (!PyRunner.pyshell || PyRunner.pyshell.terminated != false) {
            throw new Error("Python shell is not running");
        }
        const payload = {
            id,
            sourceFile: {
                path: this.payload.sourceFile.path,
                function: this.payload.sourceFile.function,
                class: this.payload.sourceFile.class,
            },
            testFile: {
                path,
                className: this.payload.testFile.className,
            },
            cwd: this.payload.cwd,
        };
        PyRunner.onInfo("Payload sent to runner.py :");
        PyRunner.onInfo(JSON.stringify(payload));
        PyRunner.pyshell.send(JSON.stringify(payload));
    }
    async runTest(payload) {
        var _a;
        const id = Math.floor(Math.random() * 10000000);
        try {
            this.payload = payload;
            PyRunner.onInfo("Running tests");
            const testFile = (0, utils_1.createTmpFile)(this.payload.sourceFile.path, this.payload.testFile.code, PyRunner.onError);
            (0, assert_1.default)(testFile, `There were an error while creating the test file ${path.dirname(this.payload.sourceFile.path)}`);
            this.testFilePath = testFile.filePath;
            this.testFileName = testFile.fileName;
            PyRunner.onInfo("Original Payload send to PyRunner.runTest ->");
            PyRunner.onInfo(this.payload);
            // We send the JSON to the python runner
            this.sendJSON(path.resolve(this.testFilePath, this.testFileName), id);
            // We create a promise to wait until the test is finished
            const defPromise = (0, misc_1.createDeferredPromise)();
            PyRunner.promises[id] = defPromise;
            // We wait the promise to be resolved, remove the temp file and return the result
            const report = await PyRunner.promises[id].promise;
            (0, utils_1.removeTmpFile)(this.testFilePath, this.testFileName, PyRunner.onError);
            return report;
        }
        catch (e) {
            if (this.testFilePath && this.testFileName) {
                (0, utils_1.removeTmpFile)(this.testFilePath, this.testFileName, PyRunner.onError);
            }
            PyRunner.onError(e);
            let msg = undefined;
            if (((_a = PyRunner.pyshell) === null || _a === void 0 ? void 0 : _a.terminated) != false) {
                try {
                    const pyVersion = (0, misc_1.getPythonVersion)(PyRunner.pythonPath);
                    if (!(0, misc_1.isPythonVersionValid)(pyVersion)) {
                        msg = `Python version ${pyVersion} located in \`${PyRunner.pythonPath}\` is not supported. Make sure you are using a Python >= 3.6.0.`;
                    }
                    else {
                        msg = `Python runner failed to load. Make sure that you have installed \`pytest\`, and try running your tests again.`;
                    }
                }
                catch (e) {
                    msg = `An error occured while trying to get your Python version, make sure you are using a Python >= 3.6.0.`;
                }
            }
            return { id, result: msg, success: false };
        }
    }
}
exports.PyRunner = PyRunner;
PyRunner.onError = () => { };
PyRunner.onInfo = () => { };
const main = async () => {
    // Success test
    console.time("success test 1");
    const pyRunner = new PyRunner();
    const jdoj = await pyRunner.runTest({
        sourceFile: {
            path: "/Users/rlegan/Downloads/ponicode-testing/validation_examples/python/foo.py",
            function: "py_native_to_iinput_value",
            class: undefined,
        },
        testFile: {
            code: "import foo\n\nclass Test_Foo_Py_native_to_iinput_value:\n    def test_py_native_to_iinput_value_1(self):\n        foo.py_native_to_iinput_value(2)\n",
            className: "Test_Foo_Py_native_to_iinput_value",
        },
        cwd: "/Users/rlegan/Downloads/ponicode-testing/validation_examples/python",
    });
    console.timeEnd("success test 1");
};
//# sourceMappingURL=index.js.map