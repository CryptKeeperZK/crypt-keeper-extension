import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { type ReactNode, useCallback } from "react";

import { IDENTITY_TYPES_TITLE_MAP, WEB2_PROVIDER_TITLE_MAP } from "@src/constants";
import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";
import { Header } from "@src/ui/components/Header";
import { Icon } from "@src/ui/components/Icon";
import { ellipsify } from "@src/util/account";

import { useIdentityPage } from "./useIdentityPage";

const Identity = (): JSX.Element | null => {
  const {
    isLoading,
    isConnectedIdentity,
    isConfirmModalOpen,
    isUpdating,
    errors,
    commitment,
    metadata,
    register,
    onGoBack,
    onConfirmDeleteIdentity,
    onDeleteIdentity,
    onUpdateIdentity,
    onGoToHost,
    onConfirmUpdate,
  } = useIdentityPage();

  const renderRow = useCallback(
    (key: string, value?: ReactNode) => (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography fontWeight="bold" variant="h6">
          {key}:
        </Typography>

        {value && (
          <Typography component="div" variant="h6">
            {value}
          </Typography>
        )}
      </Box>
    ),
    [],
  );

  const renderRenameForm = useCallback(
    () => (
      <Box component="form" sx={{ display: "flex", alignItems: "center" }} onSubmit={onConfirmUpdate}>
        <TextField
          autoFocus
          id="identityRename"
          type="text"
          {...register("name", { required: "Name is required" })}
          size="small"
          variant="outlined"
        />
      </Box>
    ),
    [register, onConfirmUpdate, onUpdateIdentity],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          height: "100%",
        }}
      >
        Loading...
      </Box>
    );
  }

  const isIdentityAvailable = commitment && metadata;

  return (
    <Box
      data-testid="identity-page"
      sx={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}
    >
      <Header />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, pb: 0 }}>
        <Typography fontWeight="bold" variant="h4">
          Identity
        </Typography>

        <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onGoBack} />
      </Box>

      {!isIdentityAvailable && !errors.root && <Typography sx={{ textAlign: "center" }}>No such identity</Typography>}

      {isIdentityAvailable && (
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Box
            sx={{
              p: 2,
              position: "absolute",
              bottom: 70,
              top: 120,
              overflow: "auto",
              width: "100%",
            }}
          >
            {renderRow(
              "Commitment",
              <Tooltip title={commitment}>
                <Typography component="span" variant="h6">
                  {ellipsify(commitment)}
                </Typography>
              </Tooltip>,
            )}

            {renderRow("Name", !isUpdating ? metadata.name : renderRenameForm())}

            {renderRow("Type", IDENTITY_TYPES_TITLE_MAP[metadata.identityStrategy])}

            {metadata.web2Provider && renderRow("Provider", WEB2_PROVIDER_TITLE_MAP[metadata.web2Provider])}

            {renderRow(
              "Owner account",
              <Tooltip title={metadata.account}>
                <Typography component="span" variant="h6">
                  {ellipsify(metadata.account)}
                </Typography>
              </Tooltip>,
            )}

            {renderRow(
              "Connected host",
              metadata.host ? (
                <Tooltip title={metadata.host}>
                  <FontAwesomeIcon data-testid="host" icon="link" style={{ cursor: "pointer" }} onClick={onGoToHost} />
                </Tooltip>
              ) : (
                "Not specified"
              ),
            )}

            <Box>
              {renderRow("Groups", metadata.groups.length === 0 ? "No groups are available" : metadata.groups.length)}

              {metadata.groups.map((group) => (
                <Box key={group.id} sx={{ ml: 2 }}>
                  {renderRow("ID", group.id)}

                  {renderRow("Name", group.name)}

                  {renderRow("Description", group.description)}

                  <Box component="hr" sx={{ my: 1 }} />
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 2, display: "flex", position: "absolute", width: "100%", bottom: 0 }}>
            <Button
              sx={{ flex: 1, mr: 1 }}
              variant="contained"
              onClick={!isUpdating ? onUpdateIdentity : onConfirmUpdate}
            >
              {!isUpdating ? "Update" : "Confirm"}
            </Button>

            <Button
              color="error"
              disabled={isConnectedIdentity}
              sx={{ flex: 1, ml: 1 }}
              variant="contained"
              onClick={onConfirmDeleteIdentity}
            >
              Delete
            </Button>
          </Box>

          {(errors.root || errors.name) && (
            <Typography color="error" sx={{ textAlign: "center" }}>
              {errors.root || errors.name}
            </Typography>
          )}
        </Box>
      )}

      <ConfirmDangerModal accept={onDeleteIdentity} isOpenModal={isConfirmModalOpen} reject={onConfirmDeleteIdentity} />
    </Box>
  );
};

export default Identity;
