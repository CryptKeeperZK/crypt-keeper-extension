import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

export interface IBackupProps {
    isLoading: boolean;
}

const Backup = ({ isLoading }: IBackupProps): JSX.Element => {
    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box data-testid="general-settings">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Import <i className="fa fa-download" aria-hidden="true" /></Typography>

                <Typography color="text.secondary" variant="body2">
                    This imports identities from an external encrypted JSON file. Your identities will not be affected.
                </Typography>

                <FormGroup sx={{ mt: 2 }}>
                    <Button
                        sx={{ textTransform: "none", width: 200 }}
                        variant="contained"
                    >
                        Import Identities
                    </Button>
                </FormGroup>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Export <i className="fa fa-upload" aria-hidden="true" /></Typography>

                <Typography color="text.secondary" variant="body2">
                    This exports current identities in an encrypted JSON file. Your identities will not be affected.
                </Typography>

                <FormGroup sx={{ mt: 2 }}>
                    <Button
                        sx={{ textTransform: "none", width: 200 }}
                        variant="contained"
                    >
                        Export Identities
                    </Button>
                </FormGroup>
            </Box>
        </Box>
    );
};

export default Backup;
