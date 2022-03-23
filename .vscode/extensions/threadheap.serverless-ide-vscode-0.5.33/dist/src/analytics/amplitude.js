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
/* eslint-disable @typescript-eslint/camelcase */
const http = require("http");
const https = require("https");
const url_1 = require("url");
class AmplitudeApiError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
    }
}
exports.AmplitudeApiError = AmplitudeApiError;
const MS_IN_HOUR = 10000;
class AmplitudeClient {
    constructor(apiKey, options = {}) {
        this.batch = [];
        this.lastSentTime = 0;
        this.isRequestInProgress = false;
        options = options || {};
        this.apiKey = apiKey;
        this.enabled = options.enabled !== false;
        this.appVersion = options.appVersion || null;
        this.setTime = options.setTime === true;
        this.maxRetries = options.maxRetries || 2;
        this.timeoutMs = options.timeoutMs || 5000;
        this.endpoint = options.endpoint || "https://api.amplitude.com";
        this.logging = options.logging;
    }
    track(event, reqOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            if (this.setTime) {
                event.time = now;
            }
            if (this.appVersion) {
                event.app_version = this.appVersion;
            }
            if (!event.insert_id) {
                event.insert_id =
                    now +
                        "_" +
                        Math.random()
                            .toString()
                            .substring(2);
            }
            const options = Object.assign({ method: "POST", path: "/2/httpapi" }, reqOptions);
            this.batch.push(event);
            if (!this.isRequestInProgress && now - this.lastSentTime > MS_IN_HOUR) {
                const events = this.batch;
                this.batch = [];
                return yield this.sendRequest(options, events);
            }
        });
    }
    dispose(reqOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign({ method: "POST", path: "/2/httpapi" }, reqOptions);
            return yield this.sendRequest(options, this.batch);
        });
    }
    sendRequest(options, events, retryCount = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRequestInProgress = true;
            const url = new url_1.URL(this.endpoint);
            options.protocol = url.protocol;
            options.hostname = url.hostname;
            options.port = url.port;
            options.timeout = this.timeoutMs;
            const data = {
                api_key: this.apiKey,
                events
            };
            const postData = JSON.stringify(data);
            const byteLength = Buffer.byteLength(postData);
            options.headers = options.headers || {};
            options.headers["Content-Type"] = "application/json";
            options.headers["Content-Length"] = byteLength;
            if (!this.enabled) {
                return {
                    body: Buffer.alloc(0),
                    start: new Date(),
                    end: new Date(),
                    requestOptions: options,
                    responseHeaders: {},
                    statusCode: 0,
                    succeeded: true,
                    retryCount: 0,
                    requestData: data
                };
            }
            const apiUrl = `${options.protocol}//${options.hostname}` +
                `${options.port ? ":" + options.port : ""}${options.path}`;
            const result = yield new Promise((resolve, reject) => {
                const start = new Date();
                try {
                    const httpLib = options.protocol === "https:" ? https : http;
                    this.log("debug", `sending request to Amplitude API ${apiUrl} (${byteLength} bytes)`);
                    const req = httpLib.request(options, res => {
                        res.on("error", reject);
                        const chunks = [];
                        res.on("data", (chunk) => chunks.push(chunk));
                        res.on("end", () => {
                            resolve({
                                start,
                                end: new Date(),
                                // should be "success" for successful requests
                                // or some kind of message for failures (or HTML for 502s)
                                body: Buffer.concat(chunks),
                                requestOptions: options,
                                responseHeaders: res.headers,
                                statusCode: res.statusCode || 0,
                                succeeded: res.statusCode === 200,
                                retryCount,
                                requestData: data
                            });
                        });
                    });
                    req.on("error", reject);
                    req.write(postData);
                    req.end();
                }
                catch (err) {
                    reject(err);
                }
            });
            // https://developers.amplitude.com/#http-status-codes--amp--retrying-failed-requests
            const retryableStatusCodes = {
                500: true,
                502: true,
                503: true,
                504: true
            };
            const elapsed = result.end.getTime() - result.start.getTime();
            if (!retryableStatusCodes[result.statusCode] ||
                retryCount >= this.maxRetries) {
                this.isRequestInProgress = false;
                this.lastSentTime = Date.now();
                if (result.succeeded) {
                    this.log("info", `successful Amplitude API call to ${apiUrl} ` +
                        `after ${retryCount} retries (${elapsed}ms)`);
                    return result;
                }
                const message = `Amplitude API call to ${apiUrl} failed with ` +
                    `status ${result.statusCode} after ${retryCount} retries` +
                    `with message: ${result.body}`;
                this.log("error", message + ` (${elapsed}ms)`);
                throw new AmplitudeApiError(message, result);
            }
            this.log("warn", `retrying Amplitude request to ${apiUrl} ` +
                `(status code: ${result.statusCode}, retries: ${retryCount})`);
            return this.sendRequest(options, events, retryCount + 1);
        });
    }
    log(level, message) {
        if (!this.logging || typeof this.logging !== "function") {
            return;
        }
        try {
            this.logging(level, message);
        }
        catch (err) {
            // ignore logging errors
        }
    }
}
exports.AmplitudeClient = AmplitudeClient;
//# sourceMappingURL=amplitude.js.map