import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";

export interface SucceededAddVerifiableCredentialProps {
  closeModal: () => void;
}

const SucceededAddVerifiableCredential = ({ closeModal }: SucceededAddVerifiableCredentialProps): JSX.Element => (
  <>
    <FullModalContent>
      <Typography>Successfully added verifiable credential to your wallet.</Typography>
    </FullModalContent>

    <FullModalFooter>
      <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Button name="reject" sx={{ textTransform: "none" }} type="button" variant="outlined" onClick={closeModal}>
          Close
        </Button>
      </Box>
    </FullModalFooter>
  </>
);

export default SucceededAddVerifiableCredential;
