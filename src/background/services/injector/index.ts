import { Approvals, PendingRequestType, RLNProofRequest, SemaphoreProofRequest } from "@src/types";
import log from "loglevel";
import LockerService from "../lock";
import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "../approval";
import ZkIdentityService from "../zkIdentity";
import { browser } from "webextension-polyfill-ts";

// @src InjectorService is a service for helping the injectedScript provider
export default class InjectorService {
    private static INSTANCE: InjectorService;

    private requestManager: RequestManager;

    private lockerService: LockerService;

    private zkIdentityService: ZkIdentityService;

    private approvalService: ApprovalService;

    private browserService: BrowserUtils;

    private constructor() {
        this.requestManager = RequestManager.getInstance();
        this.lockerService = LockerService.getInstance();
        this.zkIdentityService = ZkIdentityService.getInstance();
        this.approvalService = ApprovalService.getInstance();
        this.browserService = BrowserUtils.getInstance();
    }

    static getInstance(): InjectorService {
        if (!InjectorService.INSTANCE) {
            InjectorService.INSTANCE = new InjectorService();
        }

        return InjectorService.INSTANCE;
    }

    connect = async (payload: { origin: string }): Promise<Approvals> => {
        const { origin: host } = payload;
        if (!host) {
            throw new Error("Origin not provided");
        }

        // Check Locker
        const { isUnlocked } = await this.lockerService.getStatus();

        if (!isUnlocked) {
            await this.browserService.openPopup();
            await this.lockerService.awaitUnlock();
        }

        // Check Approval
        const isApproved = this.approvalService.isApproved(host);

        let approvalResponse: Approvals = {
            isApproved: false,
            canSkipApprove: false
        }

        if (!isApproved) {
            try {
                await this.requestManager.newRequest(PendingRequestType.INJECT, { origin: host });
                const canSkipApproveResponse = await this.approvalService.canSkipApprove(host);
                approvalResponse = { isApproved: true, canSkipApprove: canSkipApproveResponse }
            } catch (e) {
                log.error(e);
            }
        }

        if (isApproved || approvalResponse.isApproved) {
            await this.approvalService.add({ host, canSkipApprove: approvalResponse.canSkipApprove });
            await this.zkIdentityService.setIdentityHost({ host });

            // Make sure to close the approval popup
            await this.browserService.closePopup();

            // Check Identity

            // 1.1 Check available identities
            const availableIdentities = await this.zkIdentityService.getHostIdentitis({ host });

            // 1.2 If there are aviaable identities
            if (availableIdentities) {
                try {
                    await this.requestManager.newRequest(PendingRequestType.CHECK_AVIABLE_IDENTITIES, { host });
                } catch (error) {
                    // That means the user clicks on the (x) button to close the window.
                    return approvalResponse;
                }
            }

            // 1.3 If there are no aviaable identities
            await this.requestManager.newRequest(PendingRequestType.CREATE_IDENTITY, { host });
        }

        return approvalResponse;
    }

    prepareSemaphoreProofRequest = async (payload: SemaphoreProofRequest, meta: { origin: string }) => {
        const { isUnlocked } = await this.lockerService.getStatus();

        const semaphorePath = {
            circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
            zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
            verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
        };

        if (!isUnlocked) {
            await this.browserService.openPopup();
            await this.lockerService.awaitUnlock();
        }

        const identity = await this.zkIdentityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = this.approvalService.getPermission(meta.origin);

        if (!identity) {
            throw new Error("active identity not found");
        }

        if (!approved) {
            throw new Error(`${meta.origin} is not approved`);
        }

        try {
            const request = {
                ...payload,
                circuitFilePath: semaphorePath.circuitFilePath,
                zkeyFilePath: semaphorePath.zkeyFilePath,
                verificationKey: semaphorePath.verificationKey,
            };

            if (!permission.canSkipApprove) {
                await this.requestManager.newRequest(PendingRequestType.SEMAPHORE_PROOF, {
                    ...request,
                    origin: meta.origin,
                });
            }

            return { identity: identity.serialize(), payload: request };
        } finally {
            await this.browserService.closePopup();
        }
    }

    prepareRLNProofRequest = async (payload: RLNProofRequest, meta: { origin: string }) => {
        const identity = await this.zkIdentityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = this.approvalService.getPermission(meta.origin);

        const rlnPath = {
            circuitFilePath: browser.runtime.getURL("js/zkeyFiles//rln/rln.wasm"),
            zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
            verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
        };

        if (!identity) {
            throw new Error("active identity not found");
        }
        if (!approved) {
            throw new Error(`${meta.origin} is not approved`);
        }

        try {
            const request = {
                ...payload,
                circuitFilePath: rlnPath.circuitFilePath,
                zkeyFilePath: rlnPath.zkeyFilePath,
                verificationKey: rlnPath.verificationKey,
            };

            if (!permission.canSkipApprove) {
                await this.requestManager.newRequest(PendingRequestType.RLN_PROOF, {
                    ...request,
                    origin: meta.origin,
                });
            }

            return { identity: identity.serialize(), payload: request };
        } finally {
            await this.browserService.closePopup();
        }
    }
}