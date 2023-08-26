import { IdentityMetadata, IdentityWeb2Provider } from "@cryptkeeperzk/types";
import { IconName, IconPrefix } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import classNames from "classnames";

import { getEnabledFeatures } from "@src/config/features";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { Menuable } from "@src/ui/components/Menuable";
import { ellipsify } from "@src/util/account";

import "./identityListItemStyles.scss";
import { useIdentityItem } from "./useIdentityItem";

type IconWeb2Providers = Record<IdentityWeb2Provider, [IconPrefix, IconName]>;

const web2ProvidersIcons: IconWeb2Providers = {
  twitter: ["fab", "twitter"],
  reddit: ["fab", "reddit"],
  github: ["fab", "github"],
};

export interface IdentityItemProps {
  commitment: string;
  metadata: IdentityMetadata;
  isShowMenu: boolean;
  selected?: string;
  onDeleteIdentity: (commitment: string) => Promise<void>;
  onUpdateIdentityName: (commitment: string, name: string) => Promise<void>;
  onSelectIdentity?: (commitment: string) => void;
}

export const IdentityItem = ({
  commitment,
  isShowMenu,
  selected = "",
  metadata,
  onDeleteIdentity,
  onUpdateIdentityName,
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
  } = useIdentityItem({
    commitment,
    metadata,
    onDelete: onDeleteIdentity,
    onUpdate: onUpdateIdentityName,
    onSelect: onSelectIdentity,
  });

  const features = getEnabledFeatures();
  const identityTitle = features.INTERREP_IDENTITY ? "random" : "";
  const canShowIdentityType = Boolean(metadata.web2Provider || identityTitle);

  const menuItems = [
    { label: "View", isDangerItem: false, onClick: onGoToIdentity },
    { label: "Rename", isDangerItem: false, onClick: onToggleRenaming },
    { label: "Delete", isDangerItem: true, onClick: onDelete },
  ];

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
      <Icon
        className={classNames("identity-row__select-icon", {
          "identity-row__select-icon--selected": selected === commitment,
          "identity-row__select-icon--selectable": Boolean(onSelectIdentity),
        })}
        data-testid={`identity-select-${commitment}`}
        fontAwesome="fas fa-check"
        onClick={onSelect}
      />

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

            {canShowIdentityType && (
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  ml: 1,
                  py: 0.5,
                  px: 1,
                  height: 28,
                  borderRadius: 100,
                  backgroundColor: "text.500",
                  color: "text.800",
                  fontSize: "0.9rem",
                }}
              >
                {metadata.web2Provider ? (
                  <FontAwesomeIcon icon={web2ProvidersIcons[metadata.web2Provider]} title={metadata.web2Provider} />
                ) : (
                  identityTitle
                )}
              </Box>
            )}

            {metadata.host && (
              <Box
                data-testid="host-icon"
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
                <FontAwesomeIcon icon="link" title={metadata.host} />
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
      </Box>

      {isShowMenu && (
        <Menuable className="flex user-menu" items={selected !== commitment ? menuItems : [menuItems[0], menuItems[1]]}>
          <Icon className="identity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
        </Menuable>
      )}
    </Box>
  );
};
