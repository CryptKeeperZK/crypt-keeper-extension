import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { Header } from "@src/ui/components/Header";
import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";
import { UploadInput } from "@src/ui/components/UploadInput/UploadInput";

import { useUploadBackup } from "./useUploadBackup";

const UploadBackup = (): JSX.Element => {
  const { isShowPassword, isLoading, errors, register, onDrop, onGoBack, onShowPassword, onSubmit } = useUploadBackup();

  return (
    <Box data-testid="upload-backup-page">
      <Header />

      <Box p={2}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4">Upload backup</Typography>

          <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onGoBack} />
        </Box>

        <Box
          component="form"
          sx={{ mt: 3, height: 430, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          onSubmit={onSubmit}
        >
          <Box>
            <Typography fontWeight="bold" sx={{ my: 2 }} variant="body1">
              To upload your backup, please provide backup file and enter your backup password
            </Typography>

            <UploadInput
              accept={{ "application/json": [] }}
              errorMessage={errors.backupFile}
              isLoading={isLoading}
              multiple={false}
              onDrop={onDrop}
              {...register("backupFile", { required: "Backup file is required" })}
            />

            <PasswordInput
              isShowEye
              errorMessage={errors.password}
              id="password"
              isShowPassword={isShowPassword}
              label="Password"
              onShowPassword={onShowPassword}
              {...register("password", { required: "Password is required" })}
            />

            <PasswordInput
              errorMessage={errors.backupPassword}
              id="backupPassword"
              isShowPassword={isShowPassword}
              label="Backup password"
              onShowPassword={onShowPassword}
              {...register("backupPassword", { required: "Backup password is required" })}
            />

            <Button
              data-testid="upload-button"
              disabled={isLoading}
              sx={{ textTransform: "none", mt: 2, width: "100%" }}
              type="submit"
              variant="contained"
            >
              Upload
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UploadBackup;
