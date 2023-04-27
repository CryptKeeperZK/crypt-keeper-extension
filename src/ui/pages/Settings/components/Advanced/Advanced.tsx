import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

export interface IAdvancedProps {
  isLoading: boolean;
  onDeleteIdentities: () => void;
}

const Advanced = ({ isLoading, onDeleteIdentities }: IAdvancedProps): JSX.Element => {
  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box data-testid="advanced-settings">
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
    </Box>
  );
};

export default Advanced;
