import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

import { usePresentVerifiableCredential } from "./usePresentVerifiableCredential";

const PresentVerifiableCredential = (): JSX.Element => {
  const {
    isWalletConnected,
    isWalletInstalled,
    vpRequest,
    cryptkeeperVCs,
    selectedVCHashes,
    error,
    isMenuOpen,
    menuSelectedIndex,
    menuRef,
    onCloseModal,
    onRejectRequest,
    onToggleSelection,
    onToggleMenu,
    onMenuItemClick,
    onSubmitVP,
  } = usePresentVerifiableCredential();

  const menuOptions = [
    isWalletConnected ? "Sign with Metamask" : "Connect to Metamask",
    "Sign with Cryptkeeper",
    "Proceed without Signing",
  ];

  return (
    <Box
      data-testid="select-verifiable-credential-page"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <FullModalHeader onClose={onCloseModal}>Request for Verifiable Credentials</FullModalHeader>

      <FullModalContent>
        <Typography sx={{ textAlign: "center" }}>
          You have received a request to present Verifiable Credentials:
        </Typography>

        <Typography sx={{ textAlign: "center" }}>{vpRequest}</Typography>

        {cryptkeeperVCs.map(({ verifiableCredential, metadata }) => (
          <VerifiableCredentialItem
            key={metadata.hash}
            metadata={metadata}
            selected={selectedVCHashes.includes(metadata.hash)}
            verifiableCredential={verifiableCredential}
            onToggleSelectVC={onToggleSelection}
          />
        ))}
      </FullModalContent>

      {error && (
        <Typography color="error.main" fontSize="xs" sx={{ pb: 1 }} textAlign="center">
          {error}
        </Typography>
      )}

      <Box sx={{ p: "1rem", mt: "1rem", display: "flex", alignItems: "center" }}>
        <Typography sx={{ mr: 1, textAlign: "center" }}>Choose Verifiable Credential signer</Typography>

        <Tooltip
          followCursor
          title="Choose method of signing Verifiable Credentials. You may use your Cryptkeeper keys, connected Metamask, or send them unsigned."
        >
          <InfoIcon />
        </Tooltip>
      </Box>

      <FullModalFooter>
        <Box
          sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%", height: "100%" }}
        >
          <Button
            data-testid="reject-verifiable-presentation-request"
            name="reject"
            size="small"
            sx={{ textTransform: "none", flex: 1, mr: 1, height: "2rem", width: "30%" }}
            type="submit"
            variant="outlined"
            onClick={onRejectRequest}
          >
            Reject
          </Button>

          <ButtonGroup ref={menuRef} sx={{ height: "2rem", width: "70%" }} variant="contained">
            <Button
              data-testid="sign-verifiable-presentation-button"
              size="small"
              sx={{ textTransform: "none", flex: 1, ml: 1 }}
              onClick={onSubmitVP}
            >
              {menuOptions[menuSelectedIndex]}
            </Button>

            <Button data-testid="sign-verifiable-presentation-selector" sx={{ width: ".5rem" }} onClick={onToggleMenu}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>

          <Popper
            disablePortal
            transition
            anchorEl={menuRef.current}
            open={isMenuOpen}
            role={undefined}
            sx={{
              zIndex: 1,
            }}
          >
            {({ TransitionProps }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: "center top",
                }}
              >
                <Paper
                  sx={{
                    backgroundColor: "text.800",
                  }}
                >
                  <ClickAwayListener onClickAway={onToggleMenu}>
                    <MenuList autoFocusItem id="split-button-menu">
                      {menuOptions.map((option, index) => (
                        <MenuItem
                          key={option}
                          data-testid={`sign-verifiable-presentation-menu-${index}`}
                          disabled={selectedVCHashes.length === 0 || (index === 0 && !isWalletInstalled)}
                          selected={index === menuSelectedIndex}
                          onClick={() => {
                            onMenuItemClick(index);
                          }}
                        >
                          <Typography color="common.white">{option}</Typography>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Box>
      </FullModalFooter>
    </Box>
  );
};

export default PresentVerifiableCredential;
