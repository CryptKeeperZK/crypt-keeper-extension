"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.calculateNullifierHash = exports.verifyProof = exports.generateProof = void 0;
var generateProof_1 = require("./generateProof");
exports.generateProof = generateProof_1["default"];
var verifyProof_1 = require("./verifyProof");
exports.verifyProof = verifyProof_1["default"];
var calculateNullifierHash_1 = require("./calculateNullifierHash");
exports.calculateNullifierHash = calculateNullifierHash_1["default"];
__exportStar(require("./types"), exports);
