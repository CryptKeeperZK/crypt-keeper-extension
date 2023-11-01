import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useCodeExample } from "@src/hooks/useCodeExample";
import { useGlobalStyles } from "@src/styles";

import ActionBox from "../ActionBox";

interface IVerifiableCredentialsProps {
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
}

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

      <ActionBox
        code={generateVP}
        option={undefined}
        testId="add-verifiable-credential"
        title="Generate a Verifiable Presentation"
        onClick={generateVerifiablePresentationRequest}
      />
    </Box>
  );
};
