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
const Sentry = require("@sentry/node");
const crypto = require("crypto");
const node_machine_id_1 = require("node-machine-id");
const os_1 = require("os");
const vscode_extension_analytics_1 = require("vscode-extension-analytics");
const vscode_extension_analytics_2 = require("vscode-extension-analytics");
exports.AnalyticsEvent = vscode_extension_analytics_2.Event;
exports.Exception = vscode_extension_analytics_2.Exception;
const packageJson = require("../../package.json");
const amplitude_1 = require("./amplitude");
class AnalyticsClient {
    constructor(apiKey) {
        const user = os_1.userInfo({ encoding: "utf8" });
        this.amplitudeInstance = new amplitude_1.AmplitudeClient(apiKey);
        this.deviceId = node_machine_id_1.machineIdSync();
        this.userId = crypto
            .createHash("md5")
            .update(user.username)
            .digest("hex");
        this.sessionId = Date.now();
    }
    initialise() {
        Sentry.init({
            dsn: "https://710778be7bd847558250574eb19e52e9@sentry.io/1509685",
            integrations: function (integrations) {
                return integrations.filter(integration => {
                    return (integration.name !== "OnUncaughtException" &&
                        integration.name !== "OnUnhandledRejection");
                });
            },
            release: `${packageJson.name}@${packageJson.version}`
        });
        Sentry.configureScope(scope => {
            scope.setUser({
                id: this.userId
            });
            scope.setTags({
                deviceId: this.deviceId,
                sessionId: this.sessionId.toString()
            });
        });
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.amplitudeInstance.dispose();
        });
    }
    sendEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            /* eslint-disable @typescript-eslint/camelcase */
            const amplitudeEvent = {
                event_type: event.action,
                user_id: this.userId,
                device_id: this.deviceId,
                session_id: this.sessionId,
                event_properties: event.toJSON()
            };
            /* eslint-enable @typescript-eslint/camelcase */
            yield this.amplitudeInstance.track(amplitudeEvent);
        });
    }
    sendException(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Sentry.captureException(event.error);
        });
    }
}
exports.createReporter = (extensionId, extensionVersion, apiKey) => {
    const client = new AnalyticsClient(apiKey);
    return new vscode_extension_analytics_1.AnalyticsReporter(extensionId, extensionVersion, client, {
        configId: "serverlessIDE.telemetry",
        configEnabledId: "enableTelemetry"
    });
};
//# sourceMappingURL=index.js.map