import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Tooltip from "@mui/material/Tooltip";

import { useRevealMnemonic } from "./useRevealMnemonic";

export interface IRevealMnemonicInputProps {
  mnemonic: string;
}

export const RevealMnemonicInput = ({ mnemonic }: IRevealMnemonicInputProps): JSX.Element => {
  const { isShowMnemonic, isCopied, isDownloaded, onCopy, onDownload, onShowMnemonic } = useRevealMnemonic({
    mnemonic,
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
      <OutlinedInput
        multiline
        endAdornment={
          <InputAdornment position="end" sx={{ width: "35px", fontSize: "1rem", color: "white" }}>
            {isShowMnemonic ? (
              <Tooltip key={2} title="Hide mnemonic" onClick={onShowMnemonic}>
                <span>Hide</span>
              </Tooltip>
            ) : (
              <Tooltip key={2} title="Show mnemonic" onClick={onShowMnemonic}>
                <span>Show</span>
              </Tooltip>
            )}
          </InputAdornment>
        }
        inputProps={{
          sx: {
            cursor: "pointer",
            filter: !isShowMnemonic ? "blur(6px)" : undefined,
          },
        }}
        sx={{
          borderColor: "primary.main",
          borderWidth: "2px",
          color: "white",
          cursor: "pointer",
          fontSize: "1.5rem",
        }}
        type="textarea"
        value={mnemonic}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", my: 2, width: "100%" }}>
        <Button sx={{ mr: 1, textTransform: "none", width: "100%" }} variant="outlined" onClick={onCopy}>
          {isCopied ? "Copied!" : "Copy to clipboard"}
        </Button>

        <Button sx={{ ml: 1, textTransform: "none", width: "100%" }} variant="outlined" onClick={onDownload}>
          {isDownloaded ? "Downloaded!" : "Download"}
        </Button>
      </Box>
    </Box>
  );
};
