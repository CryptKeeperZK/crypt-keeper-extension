"use strict";
exports.__esModule = true;
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var keccak256_1 = require("@ethersproject/keccak256");
/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
function hash(message) {
    message = bignumber_1.BigNumber.from(message).toTwos(256).toHexString();
    message = (0, bytes_1.zeroPad)(message, 32);
    return BigInt((0, keccak256_1.keccak256)(message)) >> BigInt(8);
}
exports["default"] = hash;
