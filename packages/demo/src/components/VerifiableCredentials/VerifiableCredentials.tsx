import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

interface IVerifiableCredentialsProps {
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
}

export const VerifiableCredentials = ({
  addVerifiableCredentialRequest,
  generateVerifiablePresentationRequest,
}: IVerifiableCredentialsProps): JSX.Element => {
  const classes = useGlobalStyles();

  const { fileContent: addVCCode } = useFileReader("addVC.ts");
  const { fileContent: generateVPCode } = useFileReader("generateVP.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Accepting Verifiable Credentials</Typography>

      <ActionBox<string, void>
        code={addVCCode}
        option="UniversityDegreeCredential"
        testId="add-verifiable-credential"
        title="Add a University Degree Verifiable Credential"
        onClick={addVerifiableCredentialRequest}
      />

      <ActionBox<string, void>
        code={generateVPCode}
        option="DriversLicenseCredential"
        testId="add-verifiable-credential"
        title="Add a Drivers License Verifiable Credential"
        onClick={addVerifiableCredentialRequest}
      />

      <ActionBox<undefined, void>
        code={generateVPCode}
        option={undefined}
        testId="add-verifiable-credential"
        title="Generate a Verifiable Presentation"
        onClick={generateVerifiablePresentationRequest}
      />
    </Box>
  );
};
