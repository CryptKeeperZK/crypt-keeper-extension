"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var strings_1 = require("@ethersproject/strings");
var group_1 = require("@semaphore-protocol/group");
var identity_1 = require("@semaphore-protocol/identity");
var ffjavascript_1 = require("ffjavascript");
var calculateNullifierHash_1 = require("./calculateNullifierHash");
var generateProof_1 = require("./generateProof");
var hash_1 = require("./hash");
var packProof_1 = require("./packProof");
var unpackProof_1 = require("./unpackProof");
var verifyProof_1 = require("./verifyProof");
describe("Proof", function () {
    var treeDepth = Number(process.env.TREE_DEPTH) || 20;
    var externalNullifier = (0, strings_1.formatBytes32String)("Topic");
    var signal = (0, strings_1.formatBytes32String)("Hello world");
    var wasmFilePath = "./snark-artifacts/".concat(treeDepth, "/semaphore.wasm");
    var zkeyFilePath = "./snark-artifacts/".concat(treeDepth, "/semaphore.zkey");
    var identity = new identity_1.Identity();
    var fullProof;
    var curve;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, ffjavascript_1.getCurveFromName)("bn128")];
                case 1:
                    curve = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, curve.terminate()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe("# generateProof", function () {
        it("Should not generate Semaphore proofs if the identity is not part of the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var group, fun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        group = new group_1.Group(treeDepth);
                        group.addMembers([BigInt(1), BigInt(2)]);
                        fun = function () {
                            return (0, generateProof_1["default"])(identity, group, externalNullifier, signal, {
                                wasmFilePath: wasmFilePath,
                                zkeyFilePath: zkeyFilePath
                            });
                        };
                        return [4 /*yield*/, expect(fun).rejects.toThrow("The identity is not part of the group")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Should not generate a Semaphore proof with default snark artifacts with Node.js", function () { return __awaiter(void 0, void 0, void 0, function () {
            var group, fun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        group = new group_1.Group(treeDepth);
                        group.addMembers([BigInt(1), BigInt(2), identity.commitment]);
                        fun = function () { return (0, generateProof_1["default"])(identity, group, externalNullifier, signal); };
                        return [4 /*yield*/, expect(fun).rejects.toThrow("ENOENT: no such file or directory")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Should generate a Semaphore proof passing a group as parameter", function () { return __awaiter(void 0, void 0, void 0, function () {
            var group;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        group = new group_1.Group(treeDepth);
                        group.addMembers([BigInt(1), BigInt(2), identity.commitment]);
                        return [4 /*yield*/, (0, generateProof_1["default"])(identity, group, externalNullifier, signal, {
                                wasmFilePath: wasmFilePath,
                                zkeyFilePath: zkeyFilePath
                            })];
                    case 1:
                        fullProof = _a.sent();
                        expect(typeof fullProof).toBe("object");
                        expect(fullProof.merkleTreeRoot).toBe(group.root.toString());
                        return [2 /*return*/];
                }
            });
        }); }, 20000);
        it("Should generate a Semaphore proof passing a Merkle proof as parameter", function () { return __awaiter(void 0, void 0, void 0, function () {
            var group;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        group = new group_1.Group(treeDepth);
                        group.addMembers([BigInt(1), BigInt(2), identity.commitment]);
                        return [4 /*yield*/, (0, generateProof_1["default"])(identity, group.generateMerkleProof(2), externalNullifier, signal, {
                                wasmFilePath: wasmFilePath,
                                zkeyFilePath: zkeyFilePath
                            })];
                    case 1:
                        fullProof = _a.sent();
                        expect(typeof fullProof).toBe("object");
                        expect(fullProof.merkleTreeRoot).toBe(group.root.toString());
                        return [2 /*return*/];
                }
            });
        }); }, 20000);
    });
    describe("# verifyProof", function () {
        it("Should not verify a proof if the tree depth is wrong", function () {
            var fun = function () { return (0, verifyProof_1["default"])(fullProof, 3); };
            expect(fun).toThrow("The tree depth must be a number between 16 and 32");
        });
        it("Should verify a Semaphore proof", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, verifyProof_1["default"])(fullProof, treeDepth)];
                    case 1:
                        response = _a.sent();
                        expect(response).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("# hash", function () {
        it("Should hash the signal value correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
            var signalHash;
            return __generator(this, function (_a) {
                signalHash = (0, hash_1["default"])(signal);
                expect(signalHash.toString()).toBe("8665846418922331996225934941481656421248110469944536651334918563951783029");
                return [2 /*return*/];
            });
        }); });
        it("Should hash the external nullifier value correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
            var externalNullifierHash;
            return __generator(this, function (_a) {
                externalNullifierHash = (0, hash_1["default"])(externalNullifier);
                expect(externalNullifierHash.toString()).toBe("244178201824278269437519042830883072613014992408751798420801126401127326826");
                return [2 /*return*/];
            });
        }); });
        it("Should hash a number", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                expect((0, hash_1["default"])(2).toString()).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386");
                return [2 /*return*/];
            });
        }); });
        it("Should hash a big number", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                expect((0, hash_1["default"])(BigInt(2)).toString()).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386");
                return [2 /*return*/];
            });
        }); });
        it("Should hash an hex number", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                expect((0, hash_1["default"])("0x2").toString()).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386");
                return [2 /*return*/];
            });
        }); });
        it("Should hash an string number", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                expect((0, hash_1["default"])("2").toString()).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386");
                return [2 /*return*/];
            });
        }); });
        it("Should hash an array", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                expect((0, hash_1["default"])([2]).toString()).toBe("113682330006535319932160121224458771213356533826860247409332700812532759386");
                return [2 /*return*/];
            });
        }); });
    });
    describe("# calculateNullifierHash", function () {
        it("Should calculate the nullifier hash correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nullifierHash;
            return __generator(this, function (_a) {
                nullifierHash = (0, calculateNullifierHash_1["default"])(identity.nullifier, externalNullifier);
                expect(fullProof.nullifierHash).toBe(nullifierHash.toString());
                return [2 /*return*/];
            });
        }); });
    });
    describe("# packProof/unpackProof", function () {
        it("Should return a packed proof", function () { return __awaiter(void 0, void 0, void 0, function () {
            var originalProof, proof;
            return __generator(this, function (_a) {
                originalProof = (0, unpackProof_1["default"])(fullProof.proof);
                proof = (0, packProof_1["default"])(originalProof);
                expect(proof).toStrictEqual(fullProof.proof);
                return [2 /*return*/];
            });
        }); });
    });
});
