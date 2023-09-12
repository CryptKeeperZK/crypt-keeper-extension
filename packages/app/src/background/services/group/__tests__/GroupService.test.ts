import { defaultMerkleProof, mockDefaultIdentity, mockDefaultIdentityCommitment } from "@src/config/mock/zk";

import type {
  ICheckGroupMembershipArgs,
  IGenerateGroupMerkleProofArgs,
  IIdentityData,
  IJoinGroupMemberArgs,
} from "@cryptkeeperzk/types";

import { GroupService } from "..";

const mockGetConnectedIdentityCommitment = jest.fn(() => Promise.resolve(mockDefaultIdentityCommitment));
const mockGetConnectedIdentity = jest.fn(() => Promise.resolve(mockDefaultIdentity));

jest.mock("@src/background/services/bandada", (): unknown => ({
  BandadaService: {
    getInstance: jest.fn(() => ({
      addMember: jest.fn(() => Promise.resolve(true)),
      generateMerkleProof: jest.fn(() => Promise.resolve(defaultMerkleProof)),
      checkGroupMembership: jest.fn(() => Promise.resolve(true)),
    })),
  },
}));

jest.mock("@src/background/services/zkIdentity", (): unknown => ({
  getInstance: jest.fn(() => ({
    getConnectedIdentityCommitment: mockGetConnectedIdentityCommitment,
    getConnectedIdentity: mockGetConnectedIdentity,
  })),
}));

jest.mock("@src/background/services/history", (): unknown => ({
  getInstance: jest.fn(() => ({
    loadSettings: jest.fn(),
    trackOperation: jest.fn(),
  })),
}));

jest.mock("@src/background/services/notification", (): unknown => ({
  getInstance: jest.fn(() => ({
    create: jest.fn(),
  })),
}));

describe("background/services/group/GroupService", () => {
  beforeEach(() => {
    mockGetConnectedIdentityCommitment.mockResolvedValue(mockDefaultIdentityCommitment);

    mockGetConnectedIdentity.mockResolvedValue(mockDefaultIdentity);
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
      mockGetConnectedIdentity.mockResolvedValue(undefined as unknown as IIdentityData);
      const service = GroupService.getInstance();

      await expect(service.generateGroupMembershipProof(defaultArgs)).rejects.toThrowError(
        "No connected identity found",
      );
    });
  });

  describe("check group membership", () => {
    const defaultArgs: ICheckGroupMembershipArgs = {
      groupId: "90694543209366256629502773954857",
    };

    test("should check membership properly ", async () => {
      const service = GroupService.getInstance();

      const result = await service.checkGroupMembership(defaultArgs);

      expect(result).toBe(true);
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentityCommitment.mockResolvedValue("");
      mockGetConnectedIdentity.mockResolvedValue(undefined as unknown as IIdentityData);
      const service = GroupService.getInstance();

      await expect(service.checkGroupMembership(defaultArgs)).rejects.toThrowError("No connected identity found");
    });
  });
});
