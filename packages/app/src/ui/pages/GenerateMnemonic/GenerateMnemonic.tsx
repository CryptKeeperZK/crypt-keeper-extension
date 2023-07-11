import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { MnemonicInput } from "@src/ui/components/MnemonicInput";

import { EGenerateMnemonicMode, useGenerateMnemonic } from "./useGenerateMnemonic";

const GenerateMnemonic = (): JSX.Element => {
  const { isLoading, errors, mode, mnemonic, register, onChooseGenerateMode, onChooseInputMode, onSaveMnemonic } =
    useGenerateMnemonic();

  return (
    <Box
      component="form"
      data-testid="generate-mnemonic-page"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, p: 3 }}
      onSubmit={onSaveMnemonic}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, width: "100%" }}>
        <Icon size={8} url={logoSVG} />

        <Typography sx={{ mt: 1 }} variant="h4">
          One step left!
        </Typography>

        <Typography sx={{ my: 1 }} variant="body1">
          Please keep your mnemonic phrase safely
        </Typography>

        <MnemonicInput
          autoFocus={mode === EGenerateMnemonicMode.INPUT}
          data-testid="mnemonic-input"
          errorMessage={errors.mnemonic}
          hideOptions={mode === EGenerateMnemonicMode.INPUT}
          id="mnemonic"
          minRows={4}
          placeholder="Enter mnemonic"
          {...register("mnemonic")}
          value={mnemonic}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Button
          data-testid="submit-button"
          disabled={isLoading}
          sx={{ textTransform: "none", width: "100%", mb: 1 }}
          type="submit"
          variant="contained"
        >
          Get started!
        </Button>

        <Button
          data-testid="change-mode-button"
          disabled={isLoading}
          sx={{ textTransform: "none", width: "100%" }}
          type="button"
          variant="text"
          onClick={mode === EGenerateMnemonicMode.INPUT ? onChooseGenerateMode : onChooseInputMode}
        >
          {mode === EGenerateMnemonicMode.INPUT ? "Generate mnemonic" : "Use own mnemonic"}
        </Button>
      </Box>
    </Box>
  );
};

export default GenerateMnemonic;
