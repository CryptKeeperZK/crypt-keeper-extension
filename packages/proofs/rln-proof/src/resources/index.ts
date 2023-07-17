import { toByteArray } from 'base64-js'

import { VerificationKey } from '../types'
import { params as rawDefaultRLN20Params } from './rln-20'
import { params as rawDefaultWithdrawParams } from './withdraw'


function decodeBase64(str: string): Uint8Array {
  return new Uint8Array(toByteArray(str))
}

type ICircuitParams = {
  wasmFile: Uint8Array,
  finalZkey: Uint8Array,
}

type IRLNParams = ICircuitParams & { verificationKey: VerificationKey }
type IWithdrawParams = ICircuitParams

export const treeDepthToDefaultRLNParams: { [treeDepth: string]: IRLNParams } = {
  '20': {
    wasmFile: decodeBase64(rawDefaultRLN20Params.wasmFileB64),
    finalZkey: decodeBase64(rawDefaultRLN20Params.finalZkeyB64),
    verificationKey: JSON.parse(rawDefaultRLN20Params.verificationKey),
  },
}

export const defaultWithdrawParams: IWithdrawParams = {
  wasmFile: decodeBase64(rawDefaultWithdrawParams.wasmFileB64),
  finalZkey: decodeBase64(rawDefaultWithdrawParams.finalZkeyB64),
}

