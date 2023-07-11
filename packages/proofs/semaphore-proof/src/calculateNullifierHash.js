"use strict";
exports.__esModule = true;
var poseidon2_1 = require("poseidon-lite/poseidon2");
var hash_1 = require("./hash");
/**
 * Given the identity nullifier and the external nullifier, it calculates nullifier hash.
 * @param identityNullifier The identity nullifier.
 * @param externalNullifier The external nullifier.
 * @returns The nullifier hash.
 */
function calculateNullifierHash(identityNullifier, externalNullifier) {
    return (0, poseidon2_1.poseidon2)([(0, hash_1["default"])(externalNullifier), identityNullifier]);
}
exports["default"] = calculateNullifierHash;
