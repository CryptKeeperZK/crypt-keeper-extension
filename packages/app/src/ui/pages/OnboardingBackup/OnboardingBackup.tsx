import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";
import { UploadInput } from "@src/ui/components/UploadInput/UploadInput";

import { useOnboardingBackup } from "./useOnboardingBackup";

const OnboardingBackup = (): JSX.Element => {
  const { isShowPassword, isLoading, errors, register, onDrop, onGoBack, onShowPassword, onSubmit } =
    useOnboardingBackup();

  return (
    <Box
      data-testid="onboarding-backup-page"
      sx={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", height: "100%" }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", p: 2, flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4">Upload backup</Typography>

          <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onGoBack} />
        </Box>

        <Box
          component="form"
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            flexGrow: 1,
          }}
          onSubmit={onSubmit}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, width: "100%" }}>
            <Typography fontWeight="bold" variant="body1">
              To upload your backup, please provide backup file and backup password.
            </Typography>

            <Typography sx={{ my: 1, alignSelf: "flex-start", color: "warning.main" }} variant="body1">
              Note: backup will use backup password as your login password and mnemonic phrase from backup file
            </Typography>

            <UploadInput
              accept={{ "application/json": [".json"] }}
              errorMessage={errors.backupFile}
              isLoading={isLoading}
              multiple={false}
              onDrop={onDrop}
              {...register("backupFile", { required: "Backup file is required" })}
            />

            <Box sx={{ width: "100%" }}>
              <PasswordInput
                isShowEye
                errorMessage={errors.backupPassword}
                id="backupPassword"
                isShowPassword={isShowPassword}
                label="Backup password"
                variant="filled"
                onShowPassword={onShowPassword}
                {...register("backupPassword", { required: "Backup password is required" })}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Button
              data-testid="upload-button"
              disabled={isLoading}
              sx={{ textTransform: "none", width: "100%" }}
              type="submit"
              variant="contained"
            >
              Upload
            </Button>

            <Typography color="error" sx={{ mt: 1, mx: 1, fontSize: "0.8125rem" }} variant="body2">
              {errors.root}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingBackup;
