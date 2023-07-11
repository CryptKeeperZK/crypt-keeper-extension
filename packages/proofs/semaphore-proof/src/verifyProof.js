"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var snarkjs_1 = require("snarkjs");
var hash_1 = require("./hash");
var unpackProof_1 = require("./unpackProof");
var verificationKeys_json_1 = require("./verificationKeys.json");
/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @param treeDepth The Merkle tree depth.
 * @returns True if the proof is valid, false otherwise.
 */
function verifyProof(_a, treeDepth) {
    var merkleTreeRoot = _a.merkleTreeRoot, nullifierHash = _a.nullifierHash, externalNullifier = _a.externalNullifier, signal = _a.signal, proof = _a.proof;
    if (treeDepth < 16 || treeDepth > 32) {
        throw new TypeError("The tree depth must be a number between 16 and 32");
    }
    var verificationKey = __assign(__assign({}, verificationKeys_json_1["default"]), { vk_delta_2: verificationKeys_json_1["default"].vk_delta_2[treeDepth - 16], IC: verificationKeys_json_1["default"].IC[treeDepth - 16] });
    return snarkjs_1.groth16.verify(verificationKey, [merkleTreeRoot, nullifierHash, (0, hash_1["default"])(signal), (0, hash_1["default"])(externalNullifier)], (0, unpackProof_1["default"])(proof));
}
exports["default"] = verifyProof;
