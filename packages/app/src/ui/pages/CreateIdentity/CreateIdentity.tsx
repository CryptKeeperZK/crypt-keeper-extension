import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Controller } from "react-hook-form";

import { Checkbox } from "@src/ui/components/Checkbox";
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
    onConnectWallet,
    onCreateWithCryptkeeper,
    onCreateWithEthWallet,
  } = useCreateIdentity();

  const ethWalletTitle = isWalletConnected ? "Metamask" : "Connect to Metamask";

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
                <Input {...field} className="my-2" errorMessage={errors.nonce} id="nonce" label="Nonce" />
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
                <Box sx={{ display: "flex", my: 1 }}>
                  <Checkbox {...field} checked={field.value} id="isDeterministic" />

                  <Typography component="label" htmlFor="isDeterministic" sx={{ ml: 1 }}>
                    Deterministic identity
                  </Typography>

                  <Tooltip
                    followCursor
                    title="Deterministic identity option allows you to create identity and restore it later using the same nonce and wallet signature"
                  >
                    <InfoIcon sx={{ mt: "-2px", ml: 1 }} />
                  </Tooltip>
                </Box>
              )}
            />
          </FullModalContent>

          {errors.root && <div className="text-xs text-red-500 text-center pb-1">{errors.root}</div>}

          <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>Choose wallet to create identity</Typography>

            <Tooltip
              followCursor
              title="Identity creation can be done with your Cryptkeeper keys or with connected Ethereum wallet."
            >
              <InfoIcon />
            </Tooltip>
          </Box>
        </Box>

        <FullModalFooter>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button
              disabled={isLoading || !isWalletInstalled}
              name="metamask"
              size="small"
              sx={{ textTransform: "none", flex: 1, mr: 1 }}
              type="submit"
              variant="outlined"
              onClick={isWalletConnected ? onCreateWithEthWallet : onConnectWallet}
            >
              {isWalletInstalled ? ethWalletTitle : "Install MetaMask"}
            </Button>

            <Button
              disabled={isLoading}
              name="cryptkeeper"
              size="small"
              sx={{ textTransform: "none", flex: 1, ml: 1 }}
              type="submit"
              variant="contained"
              onClick={onCreateWithCryptkeeper}
            >
              Cryptkeeper
            </Button>
          </Box>
        </FullModalFooter>
      </Box>
    </Box>
  );
};

export default CreateIdentity;
