import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import { Header } from "@src/ui/components/Header";
import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";

import { useDownloadBackup } from "./useDownloadBackup";

const DownloadBackup = (): JSX.Element => {
  const { isShowPassword, isLoading, errors, register, onGoBack, onShowPassword, onSubmit } = useDownloadBackup();

  return (
    <Box data-testid="download-backup-page">
      <Header />

      <Box p={2}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4">Download backup</Typography>

          <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onGoBack} />
        </Box>

        <Box component="form" sx={{ my: 3 }} onSubmit={onSubmit}>
          <Box>
            <Typography fontWeight="bold" sx={{ my: 2 }} variant="body1">
              To download your backup, please enter your current password
            </Typography>

            <Typography variant="body1">Backup contains encrypted data:</Typography>

            <List dense>
              <ListItem>- Your current password</ListItem>

              <ListItem>- Your identities</ListItem>

              <ListItem>- Your site approvals</ListItem>
            </List>

            <Box sx={{ mt: 2 }}>
              <PasswordInput
                isShowEye
                errorMessage={errors.password}
                id="password"
                isShowPassword={isShowPassword}
                label="Password"
                onShowPassword={onShowPassword}
                {...register("password")}
              />
            </Box>
          </Box>

          <Button
            data-testid="download-button"
            disabled={isLoading}
            sx={{ textTransform: "none", mt: 2, width: "100%" }}
            type="submit"
            variant="contained"
          >
            Download
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DownloadBackup;
