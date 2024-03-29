import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import { isE2E } from "@src/config/env";
import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";
import { Header } from "@src/ui/components/Header";
import { Icon } from "@src/ui/components/Icon";

import { General, Backup, Security } from "./components";
import "./settings.scss";
import { SettingsTabs, useSettings } from "./useSettings";

const Settings = (): JSX.Element => {
  const {
    isLoading,
    isConfirmModalOpen,
    isConfirmStorageDelete,
    tab,
    settings,
    onTabChange,
    onEnableHistory,
    onConfirmModalShow,
    onConfirmStorageDelete,
    onDeleteAllHistory,
    onGoBack,
    onGoToBackup,
    onGoToUploadBackup,
    onGoToResetPassword,
    onDeleteAllIdentities,
    onDeleteStorage,
    onGoRevealMnemonic,
  } = useSettings();

  return (
    <Box data-testid="settings">
      <Header />

      <Box p={2}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4">Settings</Typography>

          <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onGoBack} />
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", mt: 3 }}>
          <Tabs
            orientation="vertical"
            sx={{ borderRight: 1, borderColor: "divider", minWidth: 100, width: 200 }}
            value={tab}
            onChange={onTabChange}
          >
            <Tab label={<Typography>General</Typography>} sx={{ alignItems: "flex-start" }} />

            <Tab label={<Typography>Security</Typography>} sx={{ alignItems: "flex-start" }} />

            <Tab label={<Typography>Backup</Typography>} sx={{ alignItems: "flex-start" }} />
          </Tabs>

          <Box className="settings-content" sx={{ width: "100%", px: 2, maxHeight: "30rem", overflow: "auto" }}>
            {tab === SettingsTabs.GENERAL && (
              <>
                <General
                  isLoading={isLoading}
                  settings={settings}
                  onDeleteHistory={onConfirmModalShow}
                  onEnableHistory={onEnableHistory}
                />

                <ConfirmDangerModal
                  accept={onDeleteAllHistory}
                  isOpenModal={isConfirmModalOpen}
                  reject={onConfirmModalShow}
                />
              </>
            )}

            {tab === SettingsTabs.SECURITY && (
              <Security
                isLoading={isLoading}
                onGoRevealMnemonic={onGoRevealMnemonic}
                onGoToResetPassword={onGoToResetPassword}
              />
            )}

            {tab === SettingsTabs.BACKUP && (
              <>
                <Backup
                  isLoading={isLoading}
                  onDeleteIdentities={onConfirmModalShow}
                  onDeleteStorage={onConfirmStorageDelete}
                  onGoToBackup={onGoToBackup}
                  onGoToUploadBackup={onGoToUploadBackup}
                />

                <ConfirmDangerModal
                  accept={onDeleteAllIdentities}
                  isOpenModal={isConfirmModalOpen}
                  reject={onConfirmModalShow}
                />

                {isE2E() && (
                  <ConfirmDangerModal
                    accept={onDeleteStorage}
                    isOpenModal={isConfirmStorageDelete}
                    reject={onConfirmStorageDelete}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
