import { defaultMerkleProof, mockDefaultIdentityCommitment } from "@src/config/mock/zk";

import type { IGenerateGroupMerkleProofArgs, IJoinGroupMemberArgs } from "@cryptkeeperzk/types";

import { GroupService } from "..";

const mockGetConnectedIdentityCommitment = jest.fn(() => Promise.resolve(mockDefaultIdentityCommitment));

jest.mock("@src/background/services/bandada", (): unknown => ({
  BandadaService: {
    getInstance: jest.fn(() => ({
      addMember: jest.fn(() => Promise.resolve(true)),
      generateMerkleProof: jest.fn(() => Promise.resolve(defaultMerkleProof)),
    })),
  },
}));

jest.mock("@src/background/services/zkIdentity", (): unknown => ({
  getInstance: jest.fn(() => ({
    getConnectedIdentityCommitment: mockGetConnectedIdentityCommitment,
  })),
}));

describe("background/services/group/GroupService", () => {
  beforeEach(() => {
    mockGetConnectedIdentityCommitment.mockResolvedValue(mockDefaultIdentityCommitment);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("join group", () => {
    const defaultArgs: IJoinGroupMemberArgs = {
      groupId: "90694543209366256629502773954857",
      apiKey: "api-key",
    };

    test("should join group properly", async () => {
      const service = GroupService.getInstance();

      const result = await service.joinGroup(defaultArgs);

      expect(result).toBe(true);
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentityCommitment.mockResolvedValue("");
      const service = GroupService.getInstance();

      await expect(service.joinGroup(defaultArgs)).rejects.toThrowError("No connected identity found");
    });
  });

  describe("generate group membership proof", () => {
    const defaultArgs: IGenerateGroupMerkleProofArgs = {
      groupId: "90694543209366256629502773954857",
    };

    test("should generate proof properly ", async () => {
      const service = GroupService.getInstance();

      const result = await service.generateGroupMembershipProof(defaultArgs);

      expect(result).toStrictEqual(defaultMerkleProof);
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentityCommitment.mockResolvedValue("");
      const service = GroupService.getInstance();

      await expect(service.generateGroupMembershipProof(defaultArgs)).rejects.toThrowError(
        "No connected identity found",
      );
    });
  });
});
