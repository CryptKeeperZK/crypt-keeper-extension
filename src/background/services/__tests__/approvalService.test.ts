import ApprovalService from "../approval";
import LockService from "../lock";
import SimpleStorage from "../simpleStorage";

jest.mock("../lock");

jest.mock("../simpleStorage");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/approval", () => {
  const defaultHosts = ["https://localhost:3000"];
  const serializedApprovals = JSON.stringify([[defaultHosts[0], { noApproval: true }]]);

  const defaultLockService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  beforeEach(() => {
    defaultLockService.encrypt.mockReturnValue(serializedApprovals);
    defaultLockService.decrypt.mockReturnValue(serializedApprovals);

    (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("clear", () => {
    test("should clear approved service properly", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(defaultHosts);

      await service.unlock();
      await service.clear();
      const hosts = service.getAllowedHosts();

      expect(hosts).toHaveLength(0);
      expect(approvalStorage.clear).toBeCalledTimes(1);
    });

    test("should not clear for production env", async () => {
      process.env.NODE_ENV = "production";

      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(defaultHosts);

      await service.clear();

      expect(approvalStorage.clear).not.toBeCalled();

      process.env.NODE_ENV = "test";
    });
  });

  describe("unlock", () => {
    test("should unlock properly without stored data", async () => {
      const service = new ApprovalService();
      const result = await service.unlock();
      const hosts = service.getAllowedHosts();
      const isApproved = service.isApproved(defaultHosts[0]);

      expect(result).toBe(true);
      expect(isApproved).toBe(false);
      expect(hosts).toHaveLength(0);
    });

    test("should unlock properly", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(defaultHosts);

      const result = await service.unlock();
      const hosts = service.getAllowedHosts();
      const isApproved = service.isApproved(defaultHosts[0]);

      expect(result).toBe(true);
      expect(isApproved).toBe(true);
      expect(hosts).toHaveLength(1);
      expect(hosts).toStrictEqual(defaultHosts);
    });
  });

  describe("permissions", () => {
    test("should get permissions properly", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(serializedApprovals);

      await service.unlock();
      const result = service.getPermission(defaultHosts[0]);

      expect(result).toStrictEqual({
        host: "https://localhost:3000",
        noApproval: true,
      });
    });

    test("should get permissions for unknown host", () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(serializedApprovals);

      const result = service.getPermission("unknown");

      expect(result).toStrictEqual({
        host: "unknown",
        noApproval: false,
      });
    });

    test("should set permission", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(serializedApprovals);

      const result = await service.setPermission(defaultHosts[0], { noApproval: true });
      const canSkipApprove = service.canSkipApprove(defaultHosts[0]);

      expect(result).toStrictEqual({
        host: "https://localhost:3000",
        noApproval: true,
      });
      expect(canSkipApprove).toBe(true);
      expect(approvalStorage.set).toBeCalledTimes(1);
      expect(approvalStorage.set).toBeCalledWith(serializedApprovals);
    });

    test("should set permission for unknown host", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(undefined);

      const result = await service.setPermission("unknown", { noApproval: false });

      expect(result).toStrictEqual({
        host: "unknown",
        noApproval: false,
      });
      expect(approvalStorage.set).toBeCalledTimes(1);
    });
  });

  describe("approvals", () => {
    test("should add new approval properly", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(undefined);

      await service.add({ host: defaultHosts[0], noApproval: true });
      const hosts = service.getAllowedHosts();

      expect(hosts).toStrictEqual(defaultHosts);
      expect(approvalStorage.set).toBeCalledTimes(1);
      expect(approvalStorage.set).toBeCalledWith(serializedApprovals);
    });

    test("should not approve duplicated host after unlock", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(serializedApprovals);

      await service.unlock();
      await service.add({ host: defaultHosts[0], noApproval: true });
      const hosts = service.getAllowedHosts();

      expect(hosts).toStrictEqual(defaultHosts);
      expect(approvalStorage.set).not.toBeCalled();
    });

    test("should remove approved host properly", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(serializedApprovals);

      await service.unlock();
      await service.remove({ host: defaultHosts[0] });
      const hosts = service.getAllowedHosts();

      expect(hosts).toHaveLength(0);
      expect(approvalStorage.set).toBeCalledTimes(1);
    });

    test("should not remove if there's no such approved host", async () => {
      const service = new ApprovalService();
      const [approvalStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      approvalStorage.get.mockReturnValue(serializedApprovals);

      await service.unlock();
      await service.remove({ host: "unknown" });
      const hosts = service.getAllowedHosts();

      expect(hosts).toStrictEqual(defaultHosts);
      expect(approvalStorage.set).not.toBeCalled();
    });
  });
});
