import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";

import { Paths } from "@src/constants";
import { FullModal, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { IdentityList } from "@src/ui/components/IdentityList";
import { SiteFavicon } from "@src/ui/components/SiteFavicon/SiteFavicon";

import "./connectIdentity.scss";
import { EConnectIdentityTabs, useConnectIdentity } from "./useConnectIdentity";

const ConnectIdentity = (): JSX.Element => {
  const {
    linkedIdentities,
    unlinkedIdentities,
    urlOrigin,
    faviconUrl,
    selectedTab,
    selectedIdentityCommitment,
    onTabChange,
    onSelectIdentity,
    onReject,
    onConnect,
  } = useConnectIdentity();

  return (
    <FullModal data-testid="connect-identity-page" onClose={onReject}>
      {urlOrigin && <FullModalHeader onClose={onReject}>Connect to {`"${urlOrigin}"`}</FullModalHeader>}

      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", overflowY: "auto", flex: "1 1 auto" }}>
        <SiteFavicon src={faviconUrl} />

        <Box sx={{ mx: 2 }}>
          <Typography sx={{ mb: 2, textAlign: "center" }} variant="h5">
            {`${urlOrigin} would like to connect to your identity`}
          </Typography>

          <Box sx={{ mb: 2, mx: 2, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", mr: 1, display: "inline" }}>
              Please choose one to connect with or choose to
            </Typography>

            <NavLink data-testid="create-new-identity" to={`${Paths.CREATE_IDENTITY}?back=true&urlOrigin=${urlOrigin}`}>
              create a new identity
            </NavLink>
          </Box>
        </Box>

        <Box sx={{ position: "relative", width: "100%" }}>
          <Tabs
            indicatorColor="primary"
            sx={{ width: "100%" }}
            textColor="primary"
            value={selectedTab}
            variant="fullWidth"
            onChange={onTabChange}
          >
            <Tab label="Linked" />

            <Tab label="Unlinked" />
          </Tabs>

          {selectedTab === EConnectIdentityTabs.LINKED && (
            <IdentityList
              className="connect-identity-list"
              identities={linkedIdentities}
              isShowAddNew={false}
              isShowMenu={false}
              selectedCommitment={selectedIdentityCommitment}
              onSelect={onSelectIdentity}
            />
          )}

          {selectedTab === EConnectIdentityTabs.UNLINKED && (
            <IdentityList
              className="connect-identity-list"
              identities={unlinkedIdentities}
              isShowAddNew={false}
              isShowMenu={false}
              selectedCommitment={selectedIdentityCommitment}
              onSelect={onSelectIdentity}
            />
          )}
        </Box>
      </Box>

      <FullModalFooter>
        <Button sx={{ mr: 1 }} variant="outlined" onClick={onReject}>
          Reject
        </Button>

        <Button
          data-testid="connect-identity"
          disabled={!selectedIdentityCommitment}
          sx={{ ml: 1 }}
          variant="contained"
          onClick={onConnect}
        >
          Connect
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};

export default ConnectIdentity;
