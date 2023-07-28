"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorWithMessage = void 0;
function isErrorWithMessage(error) {
    return (error !== undefined &&
        error !== null &&
        typeof error === 'object' &&
        'message' in error);
}
exports.isErrorWithMessage = isErrorWithMessage;
