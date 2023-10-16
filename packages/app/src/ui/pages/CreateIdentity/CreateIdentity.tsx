import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Controller } from "react-hook-form";

import { Checkbox } from "@src/ui/components/Checkbox";
import { DropdownButton } from "@src/ui/components/DropdownButton";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Input } from "@src/ui/components/Input";

import { useCreateIdentity } from "./useCreateIdentity";

const CreateIdentity = (): JSX.Element => {
  const {
    isLoading,
    isWalletInstalled,
    isWalletConnected,
    errors,
    control,
    onCloseModal,
    onSign,
    onGoToImportIdentity,
  } = useCreateIdentity();

  const ethWalletTitle = isWalletConnected ? "Sign with MetaMask" : "Connect to MetaMask";

  const menuOptions = [
    { id: "ck", title: "Sign with CryptKeeper", checkDisabledItem: () => isLoading },
    {
      id: "eth",
      title: isWalletInstalled ? ethWalletTitle : "Install metamask",
      checkDisabledItem: () => isLoading || !isWalletInstalled,
    },
  ];

  return (
    <Box data-testid="create-identity-page" sx={{ height: "100%" }}>
      <Box component="form" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <FullModalHeader onClose={onCloseModal}>Create identity</FullModalHeader>

        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <FullModalContent>
            <Typography sx={{ mb: 1 }}>Create your Semaphore identity</Typography>

            <Controller
              control={control}
              defaultValue={0}
              name="nonce"
              render={({ field }) => (
                <Input
                  {...field}
                  className="my-2"
                  errorMessage={errors.nonce}
                  id="nonce"
                  label="Nonce"
                  variant="filled"
                />
              )}
              rules={{
                required: "Nonce is required",
                min: { value: 0, message: "Nonce must be positive number" },
              }}
            />

            <Controller
              defaultValue
              control={control}
              name="isDeterministic"
              render={({ field }) => (
                <Box sx={{ my: 1 }}>
                  <Box sx={{ display: "flex", mb: 2 }}>
                    <Checkbox {...field} checked={field.value} id="isDeterministic" />

                    <Typography
                      component="label"
                      data-testid="deterministic-label"
                      htmlFor="isDeterministic"
                      sx={{ ml: 1 }}
                    >
                      Deterministic identity
                    </Typography>

                    <Tooltip
                      followCursor
                      title="Deterministic identity option allows you to create identity and restore it later using the same nonce and wallet signature"
                    >
                      <InfoIcon sx={{ mt: "-2px", ml: 1 }} />
                    </Tooltip>
                  </Box>

                  {!field.value && (
                    <Typography data-testid="warning-message" sx={{ color: "warning.main" }}>
                      Warning: You cannot recover this identity using your wallet and nonce. Make sure you know what you
                      are doing. Otherwise, enable deterministic option.
                    </Typography>
                  )}
                </Box>
              )}
            />
          </FullModalContent>

          {errors.root && <div className="text-xs text-red-500 text-center pb-1">{errors.root}</div>}

          <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>Choose wallet to create identity</Typography>

            <Tooltip
              followCursor
              title="Identity creation can be done with your CryptKeeper keys or with connected Ethereum wallet."
            >
              <InfoIcon />
            </Tooltip>
          </Box>
        </Box>

        <FullModalFooter>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Button
                data-testid="reject-create-identity"
                name="reject"
                size="small"
                sx={{ textTransform: "none", flex: 1, mr: 1, width: "30%" }}
                type="button"
                variant="outlined"
                onClick={onCloseModal}
              >
                Reject
              </Button>

              <DropdownButton menuOptions={menuOptions} onClick={onSign} />
            </Box>

            <Button
              data-testid="import-identity"
              sx={{ color: "primary.main", mt: 1, width: "100%" }}
              variant="text"
              onClick={onGoToImportIdentity}
            >
              Import identity
            </Button>
          </Box>
        </FullModalFooter>
      </Box>
    </Box>
  );
};

export default CreateIdentity;
