import { IVerifiableCredential } from "@cryptkeeperzk/types";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { IVerifiableCredentialMetadata } from "@src/types";
import { Menu } from "@src/ui/components/Menu";
import { ellipsify } from "@src/util/account";

import { useVerifiableCredentialItem } from "./useVerifiableCredentialItem";

export interface VerifiableCredentialItemProps {
  verifiableCredential: IVerifiableCredential;
  metadata: IVerifiableCredentialMetadata;
  selected?: boolean;
  onRenameVerifiableCredential?: (hash: string, name: string) => Promise<void>;
  onDeleteVerifiableCredential?: (hash: string) => Promise<void>;
  onToggleSelectVerifiableCredential?: (hash: string) => void;
}

export const VerifiableCredentialItem = ({
  verifiableCredential,
  metadata,
  selected = undefined,
  onRenameVerifiableCredential = undefined,
  onDeleteVerifiableCredential = undefined,
  onToggleSelectVerifiableCredential = undefined,
}: VerifiableCredentialItemProps): JSX.Element => {
  const { isRenaming, name, register, onSubmit, onToggleRenaming, onDelete, onToggleSelect } =
    useVerifiableCredentialItem({
      metadata,
      onRename: onRenameVerifiableCredential,
      onDelete: onDeleteVerifiableCredential,
      onSelect: onToggleSelectVerifiableCredential,
    });

  const menuItems = [
    { label: "Rename", isDangerItem: false, onClick: onToggleRenaming },
    { label: "Delete", isDangerItem: true, onClick: onDelete },
  ];

  const issuer =
    typeof verifiableCredential.issuer === "string"
      ? verifiableCredential.issuer
      : verifiableCredential.issuer.id || "unknown";

  const enableSelector = selected !== undefined;

  const enableMenu = onRenameVerifiableCredential !== undefined && onDeleteVerifiableCredential !== undefined;

  return (
    <Box
      key={metadata.hash}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "center",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {enableSelector &&
        (selected ? (
          <IconButton
            data-testid={`verifiable-credential-selected-${metadata.hash}`}
            size="medium"
            sx={{ mr: 2 }}
            onClick={onToggleSelect}
          >
            <CheckCircleIcon color="primary" fontSize="inherit" />
          </IconButton>
        ) : (
          <IconButton
            data-testid={`verifiable-credential-unselected-${metadata.hash}`}
            size="medium"
            sx={{ mr: 2 }}
            onClick={onToggleSelect}
          >
            <CheckCircleOutlineIcon color="disabled" fontSize="inherit" />
          </IconButton>
        ))}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {isRenaming ? (
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontSize: "large",
              fontWeight: "semibold",
            }}
            onSubmit={onSubmit}
          >
            <TextField
              {...register("name")}
              autoFocus
              id="verifiable-credential-row-rename-input"
              size="small"
              type="text"
              variant="outlined"
              onBlur={onToggleRenaming}
            />

            <IconButton
              data-testid="verifiable-credential-row-submit-rename"
              size="medium"
              sx={{ mr: 2 }}
              type="submit"
            >
              <CheckIcon color="primary" fontSize="inherit" />
            </IconButton>
          </Box>
        ) : (
          <Typography fontSize="1.125rem" fontWeight="bold" lineHeight="1.75rem">
            {name}
          </Typography>
        )}

        <Typography color="text.secondary" fontSize="1.0rem">
          Credential hash: {ellipsify(metadata.hash)}
        </Typography>

        <Typography color="text.secondary" fontSize="1.0rem">
          Issuer: {ellipsify(issuer)}
        </Typography>
      </Box>

      {enableMenu && (
        <Menu className="flex user-menu" items={menuItems}>
          <MoreHorizIcon color="secondary" fontSize="inherit" />
        </Menu>
      )}
    </Box>
  );
};
