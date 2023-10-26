import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useCodeExample } from "@src/hooks/useCodeExample";
import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

interface IVerifiableCredentialsProps {
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
}

const ADD_VC_CODE = `import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const addVerifiableCredentialRequest = async (credentialType: string) => {
  const verifiableCredential = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "http://example.edu/credentials/1872",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    issuer: {
      id: "did:example:76e12ec712ebc6f1c221ebfeb1f",
    },
    issuanceDate: new Date("2010-01-01T19:23:24Z"),
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      claims: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
  }; // Example

  const verifiableCredentialJson = JSON.stringify(mockVerifiableCredential);

  const addVerifiableCredentialRequest = async () => {
    await client?.request({
      method: RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL,
      payload: verifiableCredentialJson,
    });
  }
};`;

const GENERATE_VP_CODE = `import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const verifiablePresentationRequest = {
  request: "Please provide your University Degree Credential
   AND Drivers License Credential.",
}; // Example

const generateVerifiablePresentationRequest = async () => {
  await client?.request({
    method: RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION,
    payload: verifiablePresentationRequest,
  });
}`;

export const VerifiableCredentials = ({
  addVerifiableCredentialRequest,
  generateVerifiablePresentationRequest,
}: IVerifiableCredentialsProps): JSX.Element => {
  const classes = useGlobalStyles();

  const { code: addVC } = useCodeExample("addVC.ts");
  const { code: generateVP } = useCodeExample("generateVP.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Accepting Verifiable Credentials</Typography>

      <ActionBox<string, void>
        code={addVC}
        option="UniversityDegreeCredential"
        testId="add-verifiable-credential"
        title="Add a University Degree Verifiable Credential"
        onClick={addVerifiableCredentialRequest}
      />

      <ActionBox<string, void>
        code={generateVP}
        option="DriversLicenseCredential"
        testId="add-verifiable-credential"
        title="Add a Drivers License Verifiable Credential"
        onClick={addVerifiableCredentialRequest}
      />

      <ActionBox<undefined, void>
        code={generateVP}
        option={undefined}
        testId="add-verifiable-credential"
        title="Generate a Verifiable Presentation"
        onClick={generateVerifiablePresentationRequest}
      />
    </Box>
  );
};
