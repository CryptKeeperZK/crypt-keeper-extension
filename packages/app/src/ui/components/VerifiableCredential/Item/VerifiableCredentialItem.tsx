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
  onRenameVC?: (hash: string, name: string) => Promise<void>;
  onDeleteVC?: (hash: string) => Promise<void>;
  onSelectVC?: (hash: string) => void;
}

export const VerifiableCredentialItem = ({
  verifiableCredential,
  metadata,
  selected = undefined,
  onRenameVC = undefined,
  onDeleteVC = undefined,
  onSelectVC = undefined,
}: VerifiableCredentialItemProps): JSX.Element => {
  const { isRenaming, name, register, onRename, onToggleRenaming, onDelete, onSelect } = useVerifiableCredentialItem({
    metadata,
    onRenameVC,
    onDeleteVC,
    onSelectVC,
  });

  const menuItems = [
    { label: "Rename", isDangerItem: false, onClick: onToggleRenaming },
    { label: "Delete", isDangerItem: true, onClick: onDelete },
  ];

  const issuer =
    typeof verifiableCredential.issuer === "string"
      ? verifiableCredential.issuer
      : verifiableCredential.issuer.id || "unknown";

  const isSelectorEnabled = selected !== undefined;

  const isMenuEnabled = onRenameVC !== undefined && onDeleteVC !== undefined;

  return (
    <Box
      key={metadata.hash}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        borderBottom: "1px solid",
        borderColor: "text.800",
        cursor: "pointer",
        height: 100,
        width: "100%",

        "&::-webkit-scrollbar": {
          display: "none",
        },
        "&:hover": {
          backgroundColor: "text.900",
        },
      }}
    >
      {isSelectorEnabled &&
        (selected ? (
          <IconButton
            data-testid={`verifiable-credential-selected-${metadata.hash}`}
            size="medium"
            sx={{ ml: -2 }}
            onClick={onSelect}
          >
            <CheckCircleIcon color="primary" fontSize="inherit" />
          </IconButton>
        ) : (
          <IconButton
            data-testid={`verifiable-credential-unselected-${metadata.hash}`}
            size="medium"
            sx={{ ml: -2 }}
            onClick={onSelect}
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
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "1.125rem",
              lineHeight: "1.75rem",
            }}
            onSubmit={onRename}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "1.125rem",
              lineHeight: "1.75rem",
            }}
          >
            {name}
          </Box>
        )}

        <Typography color="text.primary">Credential hash: {ellipsify(metadata.hash)}</Typography>

        <Typography color="text.secondary" variant="body2">
          Issuer: {ellipsify(issuer)}
        </Typography>
      </Box>

      {isMenuEnabled && (
        <Menu className="flex user-menu" items={menuItems}>
          <MoreHorizIcon color="secondary" fontSize="inherit" />
        </Menu>
      )}
    </Box>
  );
};
