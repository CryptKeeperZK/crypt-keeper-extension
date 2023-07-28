import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

import { isE2E } from "@src/config/env";

export interface IBackupProps {
  isLoading: boolean;
  onDeleteIdentities: () => void;
  onDeleteStorage: () => void;
  onGoToBackup: () => void;
  onGoToUploadBackup: () => void;
}

const Backup = ({
  isLoading,
  onDeleteIdentities,
  onGoToBackup,
  onDeleteStorage,
  onGoToUploadBackup,
}: IBackupProps): JSX.Element => {
  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box data-testid="backup-settings">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Backup</Typography>

        <Typography color="text.secondary" variant="body2">
          You can backup your storage containing identities, site approvals, password and wallet into an encrypted JSON
          file.
        </Typography>

        <FormGroup sx={{ my: 2 }}>
          <Button sx={{ textTransform: "none", width: 200 }} variant="contained" onClick={onGoToBackup}>
            Download backup
          </Button>
        </FormGroup>

        <Typography color="text.secondary" variant="body2">
          If you have a backup file you can upload it and merge with your current extension data.
        </Typography>

        <FormGroup sx={{ mt: 2 }}>
          <Button sx={{ textTransform: "none", width: 200 }} variant="contained" onClick={onGoToUploadBackup}>
            Upload backup
          </Button>
        </FormGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Clear identities</Typography>

        <Typography color="text.secondary" variant="body2">
          This resets the identity storage and erases data from the identities tab. This is not revertable operation.
        </Typography>

        <FormGroup sx={{ mt: 2 }}>
          <Button
            color="error"
            sx={{ textTransform: "none", width: 200 }}
            variant="contained"
            onClick={onDeleteIdentities}
          >
            Delete all identities
          </Button>
        </FormGroup>
      </Box>

      {isE2E() && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Delete storage data</Typography>

          <Typography color="text.secondary" variant="body2">
            This erases the whole storage data. This is not revertable operation.
          </Typography>

          <FormGroup sx={{ mt: 2 }}>
            <Button
              color="error"
              sx={{ textTransform: "none", width: 200 }}
              variant="contained"
              onClick={onDeleteStorage}
            >
              Delete storage
            </Button>
          </FormGroup>
        </Box>
      )}
    </Box>
  );
};

export default Backup;
