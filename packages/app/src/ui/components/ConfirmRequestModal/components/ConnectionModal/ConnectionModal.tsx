import { IPendingRequest } from "@cryptkeeperzk/types";
import { Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";

import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModal, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { IdentityList } from "@src/ui/components/IdentityList";
import { SiteFavicon } from "@src/ui/components/SiteFavicon/SiteFavicon";

import { CreateIdentityModal } from "../createIdentityModal";

import "./connectIdentity.scss";
import { EConnectIdentityTabs, useConnectIdentity } from "./useConnectionModal";

export interface IConnectIdentityModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: IPendingRequest<{ urlOrigin: string }>;
  accept: () => void;
  reject: () => void;
}

export const ConnectIdentityModal = ({
  len,
  pendingRequest,
  error,
  loading,
  accept,
  reject,
}: IConnectIdentityModalProps): JSX.Element => {
  const {
    linkedIdentities,
    unlinkedIdentities,
    urlOrigin,
    faviconUrl,
    selectedTab,
    selectedIdentityCommitment,
    onTabChange,
    onSelectIdentity,
    openCreateIdentityModal,
    onCreateIdentityModalShow,
    onReject,
    onAccept,
  } = useConnectIdentity({
    pendingRequest,
    accept,
    reject,
  });

  return (
    <div>
      {openCreateIdentityModal ? (
        <CreateIdentityModal connectIdentityCallback={onCreateIdentityModalShow} urlOrigin={urlOrigin} />
      ) : (
        <FullModal data-testid="connect-identity-page" onClose={onReject}>
          {urlOrigin && <FullModalHeader onClose={onReject}>Connect to {`"${urlOrigin}"`}</FullModalHeader>}

          {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}

          <Box
            sx={{ display: "flex", alignItems: "center", flexDirection: "column", overflowY: "auto", flex: "1 1 auto" }}
          >
            <SiteFavicon src={faviconUrl} />

            <Box sx={{ mx: 2 }}>
              <Typography sx={{ mb: 2, textAlign: "center" }} variant="h5">
                {`${urlOrigin} would like to connect to your identity`}
              </Typography>

              <Box sx={{ mb: 2, mx: 2, textAlign: "center" }}>
                <Typography sx={{ color: "text.secondary", mr: 1, display: "inline" }}>
                  Please choose one to connect with or choose to
                </Typography>

                <NavLink data-testid="create-new-identity" to="#" onClick={onCreateIdentityModalShow}>
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

          {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

          <FullModalFooter>
            <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={onReject}>
              Reject
            </Button>

            <Button
              className="ml-2"
              data-testid="connect-identity"
              disabled={!selectedIdentityCommitment}
              loading={loading}
              onClick={onAccept}
            >
              Connect
            </Button>
          </FullModalFooter>
        </FullModal>
      )}
    </div>
  );
};
