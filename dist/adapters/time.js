"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromSecondsToMilliseconds = exports.fromMillisecondsToSeconds = void 0;
function fromMillisecondsToSeconds(timeInMilliseconds) {
    return Math.floor(timeInMilliseconds / 1000);
}
exports.fromMillisecondsToSeconds = fromMillisecondsToSeconds;
function fromSecondsToMilliseconds(timeInSeconds) {
    return timeInSeconds * 1000;
}
exports.fromSecondsToMilliseconds = fromSecondsToMilliseconds;
