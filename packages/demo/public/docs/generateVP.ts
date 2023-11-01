import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const verifiablePresentationRequest = {
  request: "Please provide your University Degree Credential AND Drivers License Credential.",
}; // Example

const generateVerifiablePresentationRequest = async (): Promise<void> => {
  await client?.request({
    method: RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION,
    payload: verifiablePresentationRequest,
  });
};

export { generateVerifiablePresentationRequest };
