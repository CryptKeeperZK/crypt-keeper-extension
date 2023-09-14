import { hexToBigint } from "bigint-conversion";

import { getBandadaApiUrl } from "@src/config/env";

import type {
  IMerkleProof,
  IGenerateBandadaMerkleProofArgs,
  IAddBandadaGroupMemberArgs,
  ICheckBandadaGroupMembershipArgs,
} from "@cryptkeeperzk/types";

const API_URL = getBandadaApiUrl();

const DEFAULT_HEADERS = {
  accept: "application/json",
  "Content-Type": "application/json",
};

export class BandadaService {
  private static INSTANCE?: BandadaService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance = (): BandadaService => {
    if (!BandadaService.INSTANCE) {
      BandadaService.INSTANCE = new BandadaService();
    }

    return BandadaService.INSTANCE;
  };

  async addMember({ groupId, identity, apiKey, inviteCode }: IAddBandadaGroupMemberArgs): Promise<boolean> {
    if (!apiKey && !inviteCode) {
      throw new Error("Provide api key or invide code");
    }

    if (apiKey && inviteCode) {
      throw new Error("Don't provide both api key and invide code");
    }

    const response = await fetch(`${API_URL}/groups/${groupId}/members/${hexToBigint(identity.commitment)}`, {
      method: "POST",
      headers: apiKey ? { ...DEFAULT_HEADERS, "x-api-key": apiKey } : DEFAULT_HEADERS,
      body: inviteCode ? JSON.stringify({ inviteCode }) : undefined,
    });

    if (response.ok) {
      return true;
    }

    const result = (await response.json()) as { message: string | string[] };

    throw new Error(result.message.toString());
  }

  async checkGroupMembership({ identity, groupId }: ICheckBandadaGroupMembershipArgs): Promise<boolean> {
    const response = await fetch(`${API_URL}/groups/${groupId}/members/${hexToBigint(identity.commitment)}`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      const result = (await response.json()) as { message: string };
      throw new Error(result.message.toString());
    }

    const result = (await response.json()) as string;

    return JSON.parse(result) as boolean;
  }

  async generateMerkleProof({ groupId, identity }: IGenerateBandadaMerkleProofArgs): Promise<IMerkleProof> {
    const response = await fetch(`${API_URL}/groups/${groupId}/members/${hexToBigint(identity.commitment)}/proof`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    const result = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error((result as { message: string }).message);
    }

    return result as IMerkleProof;
  }
}
