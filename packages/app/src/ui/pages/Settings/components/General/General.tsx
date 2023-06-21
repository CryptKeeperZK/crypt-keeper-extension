import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

import type { HistorySettings } from "@src/types";

export interface IGeneralProps {
  isLoading: boolean;
  settings?: HistorySettings;
  onEnableHistory: () => void;
  onDeleteHistory: () => void;
}

const General = ({ isLoading, settings = undefined, onEnableHistory, onDeleteHistory }: IGeneralProps): JSX.Element => {
  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box data-testid="general-settings">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">History tracking</Typography>

        <Typography color="text.secondary" variant="body2">
          This settings is responsible for history writing. If you do not want to keep history of your actions, you can
          disable history tracking.
        </Typography>

        <FormGroup>
          <FormControlLabel
            checked={Boolean(settings?.isEnabled)}
            control={<Checkbox data-testid="keepTrackHistory" id="keepTrackHistory" />}
            label="Keep track history"
            onChange={onEnableHistory}
          />
        </FormGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Clear history</Typography>

        <Typography color="text.secondary" variant="body2">
          This cleans the operation history store. Your identities will not be affected.
        </Typography>

        <FormGroup sx={{ mt: 2 }}>
          <Button
            color="error"
            sx={{ textTransform: "none", width: 200 }}
            variant="contained"
            onClick={onDeleteHistory}
          >
            Clear operation history
          </Button>
        </FormGroup>
      </Box>
    </Box>
  );
};

export default General;
