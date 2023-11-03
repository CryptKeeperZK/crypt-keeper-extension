import { mockDefaultIdentity } from "@src/config/mock/zk";

import type {
  IMerkleProof,
  IGenerateBandadaMerkleProofArgs,
  IAddBandadaGroupMemberArgs,
  ICheckBandadaGroupMembershipArgs,
} from "@cryptkeeperzk/types";

import { BandadaService } from "..";

describe("background/services/bandada/BandadaService", () => {
  const defaultGenerateProofArgs: IGenerateBandadaMerkleProofArgs = {
    groupId: "90694543209366256629502773954857",
    identity: mockDefaultIdentity,
  };

  const defaultAddMemberArgs: IAddBandadaGroupMemberArgs = {
    groupId: "90694543209366256629502773954857",
    apiKey: "key",
    identity: mockDefaultIdentity,
  };

  const defaultCheckMembershipArgs: ICheckBandadaGroupMembershipArgs = {
    groupId: "90694543209366256629502773954857",
    identity: mockDefaultIdentity,
  };

  const defaultMerkleProof: IMerkleProof = {
    root: "11390644220109896790698822461687897006579295248439520803064795506754669709244",
    leaf: "1234",
    pathIndices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    siblings: [
      "80877997493538069559805206308114670727110736600665804098123416503841828789",
      "2661044082233456058396187727098375728375921643200540748303695324136976348253",
      "6096293672069786665857538772479257078181838217364432218857495446476026762057",
      "3213387431893684378405765868577693015834376929238162022878266214072895455115",
      "20873329779514886950857383505470593016903620913772324962410074165591568803394",
      "6780943624108258257653151532939766717932945406271650974357241654843472858665",
      "21264138240952572850140232066791887744399569043495230428828286092356682795946",
      "452690015127872896741024235227645852595273621123293637442645322262521332023",
      "2595356927643734846847031846821710482273691477249262580099245601142003997940",
      "8418211123976457425433501316977760560691985592100552826252534497564882890941",
      "1537191400622107328684413318308617657718139563407569116311138837249085215051",
      "19872494822529698336428544644892152939259230790072431463549730793528149292630",
      "16072162194136580487384840145401874130512458959837858730029838869629765668242",
      "2323486562512231983962497291910923278949418891416728247450223252317951409897",
      "11111655209094453582080417077736218640786807288404840495874333175450589148848",
      "13466888144525985340510020716136796993278178506345459094150505308504997365580",
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add member to group properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(),
    } as Response);
    const service = BandadaService.getInstance();

    const result = await service.addMember(defaultAddMemberArgs);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should add member to group properly with invide code", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(),
    } as Response);
    const service = BandadaService.getInstance();

    const result = await service.addMember({ ...defaultAddMemberArgs, apiKey: undefined, inviteCode: "code" });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should throw error if can't add member to group", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: ["Error 1", "Error 2"] }),
    } as Response);
    const service = BandadaService.getInstance();

    await expect(service.addMember(defaultAddMemberArgs)).rejects.toThrow("Error 1,Error 2");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("should throw error if add member is called without required params", async () => {
    const args = { ...defaultAddMemberArgs, apiKey: undefined, inviteCode: undefined };
    const service = BandadaService.getInstance();

    await expect(service.addMember(args)).rejects.toThrow("Provide api key or invide code");
  });

  test("should throw error if add member is called with both required params", async () => {
    const args = { ...defaultAddMemberArgs, apiKey: "key", inviteCode: "code" };
    const service = BandadaService.getInstance();

    await expect(service.addMember(args)).rejects.toThrow("Don't provide both api key and invide code");
  });

  test("should generate merkle proof properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(defaultMerkleProof),
    } as Response);
    const service = BandadaService.getInstance();

    const proof = await service.generateMerkleProof(defaultGenerateProofArgs);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(proof).toStrictEqual(defaultMerkleProof);
  });

  test("should throw error if can't generate merkle proof properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Error" }),
    } as Response);
    const service = BandadaService.getInstance();

    await expect(service.generateMerkleProof(defaultGenerateProofArgs)).rejects.toThrow("Error");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("should check membership properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve("true"),
    } as Response);
    const service = BandadaService.getInstance();

    const result = await service.checkGroupMembership(defaultCheckMembershipArgs);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should check membership properly if user is not a member", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve("false"),
    } as Response);
    const service = BandadaService.getInstance();

    const result = await service.checkGroupMembership(defaultCheckMembershipArgs);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  test("should throw error if can't check membership in group", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Error" }),
    } as Response);
    const service = BandadaService.getInstance();

    await expect(service.checkGroupMembership(defaultCheckMembershipArgs)).rejects.toThrow("Error");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
