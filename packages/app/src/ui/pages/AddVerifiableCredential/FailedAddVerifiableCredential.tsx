import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";

export interface FailedAddVerifiableCredentialProps {
  closeModal: () => void;
}

const FailedAddVerifiableCredential = ({ closeModal }: FailedAddVerifiableCredentialProps): JSX.Element => (
  <>
    <FullModalContent>
      <Typography>
        Failed to add verifiable credential to your wallet. The credential may be improperly formatted or you may
        already have this credential. Otherwise, please try again.
      </Typography>
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

export default FailedAddVerifiableCredential;
