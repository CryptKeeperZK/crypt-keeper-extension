import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";
import { Header } from "@src/ui/components/Header";

import { General } from "./components";
import { SettingsTabs, useSettings } from "./useSettings";

const Settings = (): JSX.Element => {
  const {
    isLoading,
    isConfirmModalOpen,
    tab,
    settings,
    onTabChange,
    onEnableHistory,
    onConfirmModalShow,
    onDeleteAllHistory,
  } = useSettings();

  return (
    <Box data-testid="settings">
      <Header />

      <Box p={2}>
        <Box>
          <Typography variant="h4">Settings</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", mt: 3 }}>
          <Tabs
            orientation="vertical"
            sx={{ borderRight: 1, borderColor: "divider", width: 200 }}
            value={tab}
            onChange={onTabChange}
          >
            <Tab label={<Typography>General</Typography>} sx={{ alignItems: "flex-start" }} />

            {/* <Tab label={<Typography>Advanced</Typography>} sx={{ alignItems: "flex-start" }} /> */}
          </Tabs>

          <Box sx={{ width: "100%", px: 2 }}>
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
