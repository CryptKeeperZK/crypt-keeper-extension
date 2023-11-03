import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import WalletService from "@src/background/services/wallet";
import { Paths } from "@src/constants";
import { OperationType } from "@src/types";
import { serializeVP } from "@src/util/credentials";

import type { IVerifiablePresentation, IVerifiablePresentationRequest, IZkMetadata } from "@cryptkeeperzk/types";
import type { IGenerateVerifiablePresentationWithCryptkeeperArgs } from "@src/types/verifiableCredentials";

const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

export default class VerifiablePresentationService {
  private static INSTANCE?: VerifiablePresentationService;

  private walletService: WalletService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private browserController: BrowserUtils;

  private constructor() {
    this.walletService = WalletService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.browserController = BrowserUtils.getInstance();
  }

  static getInstance(): VerifiablePresentationService {
    if (!VerifiablePresentationService.INSTANCE) {
      VerifiablePresentationService.INSTANCE = new VerifiablePresentationService();
    }

    return VerifiablePresentationService.INSTANCE;
  }

  generateRequest = async ({ request }: IVerifiablePresentationRequest, { urlOrigin }: IZkMetadata): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.GENERATE_VERIFIABLE_PRESENTATION_REQUEST,
        request,
        urlOrigin,
      },
    });
  };

  generate = async (payload: IVerifiablePresentation, { urlOrigin }: IZkMetadata): Promise<void> => {
    await this.historyService.trackOperation(OperationType.GENERATE_VERIFIABLE_PRESENTATION, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Presentation generated.",
        message: `Generated 1 Verifiable Presentation.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    await this.browserController.pushEvent(
      {
        type: EventName.GENERATE_VERIFIABLE_PRESENTATION,
        payload: { verifiablePresentation: payload },
      },
      { urlOrigin },
    );
  };

  generateWithCryptkeeper = async (
    { verifiablePresentation, address, created = new Date() }: IGenerateVerifiablePresentationWithCryptkeeperArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    const serialized = serializeVP(verifiablePresentation);
    const signature = await this.walletService.signMessage({
      message: serialized,
      address,
    });

    const signedVerifiablePresentation = {
      ...verifiablePresentation,
      proof: [
        {
          type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
          proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
          verificationMethod: address,
          created,
          proofValue: signature,
        },
      ],
    };

    await this.historyService.trackOperation(OperationType.GENERATE_VERIFIABLE_PRESENTATION, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Presentation generated.",
        message: `Generated 1 Verifiable Presentation.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    await this.browserController.pushEvent(
      {
        type: EventName.GENERATE_VERIFIABLE_PRESENTATION,
        payload: { verifiablePresentation: signedVerifiablePresentation },
      },
      { urlOrigin },
    );
  };
}
