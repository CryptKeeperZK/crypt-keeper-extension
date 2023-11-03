/* eslint-disable @typescript-eslint/unbound-method */
import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import { VerifiablePresentationService } from "@src/background/services/credentials";
import pushMessage from "@src/util/pushMessage";

import {
  defaultMetadata,
  defaultPopupTab,
  defaultTabs,
  exampleVerifiablePresentation,
  exampleVerifiablePresentationRequest,
} from "../__mocks__/mock";

const exampleSignature = "ck-signature";

jest.mock("@src/background/services/wallet", (): unknown => ({
  getInstance: jest.fn(() => ({
    signMessage: jest.fn(() => Promise.resolve(exampleSignature)),
  })),
}));

jest.mock("@src/util/pushMessage");

describe("background/services/credentials/VerifiablePresentationService", () => {
  const verifiablePresentationService = VerifiablePresentationService.getInstance();

  beforeEach(() => {
    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);
  });

  afterEach(() => {
    (pushMessage as jest.Mock).mockClear();

    (browser.tabs.create as jest.Mock).mockClear();

    (browser.tabs.sendMessage as jest.Mock).mockClear();
  });

  describe("generate verifiable presentations", () => {
    test("should successfully create a generate verifiable presentation request", async () => {
      await verifiablePresentationService.generateRequest(exampleVerifiablePresentationRequest, {});

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toHaveBeenCalledWith(defaultOptions);
    });

    test("should successfully generate a verifiable presentation", async () => {
      await verifiablePresentationService.generate(exampleVerifiablePresentation, defaultMetadata);

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(defaultTabs[0].id, {
        type: EventName.GENERATE_VERIFIABLE_PRESENTATION,
        payload: { verifiablePresentation: exampleVerifiablePresentation },
      });
    });

    test("should successfully generate a verifiable presentation with cryptkeeper", async () => {
      const exampleAddress = "0x123";
      const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
      const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

      const created = new Date();
      await verifiablePresentationService.generateWithCryptkeeper(
        {
          verifiablePresentation: exampleVerifiablePresentation,
          address: exampleAddress,
          created,
        },
        defaultMetadata,
      );

      const signedVerifiablePresentation = {
        ...exampleVerifiablePresentation,
        proof: [
          {
            type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
            proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
            verificationMethod: exampleAddress,
            created,
            proofValue: exampleSignature,
          },
        ],
      };

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(defaultTabs[0].id, {
        type: EventName.GENERATE_VERIFIABLE_PRESENTATION,
        payload: { verifiablePresentation: signedVerifiablePresentation },
      });
    });

    test("should successfully generate a verifiable presentation without date", async () => {
      const exampleAddress = "0x123";

      await verifiablePresentationService.generateWithCryptkeeper(
        {
          verifiablePresentation: exampleVerifiablePresentation,
          address: exampleAddress,
        },
        defaultMetadata,
      );

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
    });
  });
});
