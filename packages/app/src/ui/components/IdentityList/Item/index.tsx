import { IIdentityMetadata } from "@cryptkeeperzk/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import classNames from "classnames";
import compact from "lodash/compact";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { Menu } from "@src/ui/components/Menu";
import { ellipsify } from "@src/util/account";

import "./identityListItemStyles.scss";
import { useIdentityItem } from "./useIdentityItem";

export interface IdentityItemProps {
  commitment: string;
  metadata: IIdentityMetadata;
  isShowMenu: boolean;
  connectedOrigin?: string;
  selected?: string;
  onDeleteIdentity: (commitment: string) => Promise<void>;
  onUpdateIdentityName: (commitment: string, name: string) => Promise<void>;
  onDisconnectIdentity: (commitment: string) => Promise<void>;
  onSelectIdentity?: (commitment: string) => void;
}

export const IdentityItem = ({
  commitment,
  isShowMenu,
  selected = "",
  metadata,
  connectedOrigin = "",
  onDeleteIdentity,
  onUpdateIdentityName,
  onDisconnectIdentity,
  onSelectIdentity = undefined,
}: IdentityItemProps): JSX.Element => {
  const {
    isRenaming,
    errors,
    register,
    onGoToHost,
    onGoToIdentity,
    onUpdateName,
    onToggleRenaming,
    onDeleteIdentity: onDelete,
    onSelectIdentity: onSelect,
    onDisconnectIdentity: onDisconnect,
  } = useIdentityItem({
    commitment,
    metadata,
    connectedOrigin,
    onDelete: onDeleteIdentity,
    onUpdate: onUpdateIdentityName,
    onSelect: onSelectIdentity,
    onDisconnect: onDisconnectIdentity,
  });

  const menuItems = compact([
    { label: "View", isDangerItem: false, onClick: onGoToIdentity },
    { label: "Rename", isDangerItem: false, onClick: onToggleRenaming },
    connectedOrigin && { label: "Disconnect", isDangerItem: true, onClick: onDisconnect },
    { label: "Delete", isDangerItem: true, onClick: onDelete },
  ]);

  return (
    <Box
      key={commitment}
      data-testid="identity-row"
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

        "&:hover": {
          backgroundColor: "text.900",
        },
      }}
    >
      {onSelectIdentity ? (
        <Icon
          className={classNames("identity-row__select-icon", {
            "identity-row__select-icon--selected": selected === commitment,
            "identity-row__select-icon--selectable": true,
          })}
          data-testid={`identity-select-${commitment}`}
          fontAwesome="fas fa-check"
          onClick={onSelect}
        />
      ) : (
        <Jazzicon diameter={32} paperStyles={{ marginRight: "1rem" }} seed={jsNumberForAddress(commitment)} />
      )}

      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
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
            onSubmit={onUpdateName}
          >
            <Input
              autoFocus
              className="identity-row__input-field"
              errorMessage={errors.root || errors.name}
              id="identityRename"
              label=""
              type="text"
              variant="filled"
              {...register("name", { required: "Name is required" })}
            />

            <Icon
              className="identity-row__select-icon--selected"
              data-testid={`identity-rename-${commitment}`}
              fontAwesome="fa-solid fa-check"
              size={1}
              onClick={onUpdateName}
            />
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
            {metadata.name}

            {connectedOrigin && (
              <Box
                data-testid="urlOrigin-icon"
                sx={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  ml: 1,
                  height: 28,
                  width: 28,
                  backgroundColor: "text.500",
                  borderRadius: "100%",
                  color: "text.800",
                  fontSize: "0.9rem",
                }}
                onClick={onGoToHost}
              >
                <FontAwesomeIcon icon="link" title={connectedOrigin} />
              </Box>
            )}
          </Box>
        )}

        <Typography color="text.primary">Commitment: {ellipsify(commitment)}</Typography>

        {metadata.account && (
          <Typography color="text.secondary" variant="body2">
            Address: {ellipsify(metadata.account)}
          </Typography>
        )}

        {metadata.isImported && (
          <Typography color="text.secondary" variant="body2">
            Imported
          </Typography>
        )}
      </Box>

      {isShowMenu && (
        <Menu className="flex user-menu" items={menuItems}>
          <Icon className="identity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
        </Menu>
      )}
    </Box>
  );
};
