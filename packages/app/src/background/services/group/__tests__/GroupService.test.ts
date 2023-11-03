import browser from "webextension-polyfill";

import { defaultMerkleProof, mockDefaultConnection, mockDefaultIdentity } from "@src/config/mock/zk";

import type {
  ICheckGroupMembershipArgs,
  IGenerateGroupMerkleProofArgs,
  IIdentityData,
  IJoinGroupMemberArgs,
  IZkMetadata,
} from "@cryptkeeperzk/types";

import GroupService from "..";

const mockGetConnectedIdentity = jest.fn(() => mockDefaultIdentity);

jest.mock("@src/background/services/bandada", (): unknown => ({
  BandadaService: {
    getInstance: jest.fn(() => ({
      addMember: jest.fn(() => Promise.resolve(true)),
      generateMerkleProof: jest.fn(() => Promise.resolve(defaultMerkleProof)),
      checkGroupMembership: jest.fn(() => Promise.resolve(true)),
    })),
  },
}));

jest.mock("@src/background/services/connection", (): unknown => ({
  getInstance: jest.fn(() => ({
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
  const metadata: IZkMetadata = {
    urlOrigin: mockDefaultConnection.urlOrigin,
  };

  beforeEach(() => {
    mockGetConnectedIdentity.mockReturnValue(mockDefaultIdentity);

    (browser.tabs.create as jest.Mock).mockResolvedValue({});

    (browser.tabs.query as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("join group", () => {
    const defaultArgs: IJoinGroupMemberArgs = {
      groupId: "90694543209366256629502773954857",
      apiKey: "api-key",
    };

    test("should request group joining properly", async () => {
      const service = GroupService.getInstance();

      await expect(service.joinGroupRequest(defaultArgs, metadata)).resolves.toBeUndefined();
      await expect(service.joinGroupRequest({ groupId: defaultArgs.groupId }, metadata)).resolves.toBeUndefined();
    });

    test("should join group properly", async () => {
      const service = GroupService.getInstance();

      const result = await service.joinGroup(defaultArgs, metadata);

      expect(result).toBe(true);
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockReturnValue(undefined as unknown as IIdentityData);
      const service = GroupService.getInstance();

      await expect(service.joinGroup(defaultArgs, metadata)).rejects.toThrow("No connected identity found");
    });
  });

  describe("generate group merkle proof", () => {
    const defaultArgs: IGenerateGroupMerkleProofArgs = {
      groupId: "90694543209366256629502773954857",
    };

    test("should request generate group merkle proof properly", async () => {
      const service = GroupService.getInstance();

      await expect(service.generateGroupMerkleProofRequest(defaultArgs, metadata)).resolves.toBeUndefined();
    });

    test("should generate proof properly ", async () => {
      const service = GroupService.getInstance();

      const result = await service.generateGroupMerkleProof(defaultArgs, metadata);

      expect(result).toStrictEqual(defaultMerkleProof);
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockReturnValue(undefined as unknown as IIdentityData);
      const service = GroupService.getInstance();

      await expect(service.generateGroupMerkleProof(defaultArgs, metadata)).rejects.toThrow(
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

      const result = await service.checkGroupMembership(defaultArgs, metadata);

      expect(result).toBe(true);
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockReturnValue(undefined as unknown as IIdentityData);
      const service = GroupService.getInstance();

      await expect(service.checkGroupMembership(defaultArgs, metadata)).rejects.toThrow("No connected identity found");
    });
  });
});
