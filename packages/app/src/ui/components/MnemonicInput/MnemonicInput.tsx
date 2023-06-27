import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput, { OutlinedInputProps } from "@mui/material/OutlinedInput";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Ref, forwardRef } from "react";

import "./mnemonicInput.scss";
import { useMnemonicInput } from "./useMnemonicInput";

export interface IMnemonicInputProps extends OutlinedInputProps {
  hideOptions?: boolean;
  errorMessage?: string;
}

const MnemonicInputUI = (
  { errorMessage = "", hideOptions = false, value, ...rest }: IMnemonicInputProps,
  ref: Ref<unknown>,
): JSX.Element => {
  const { isShowMnemonic, isCopied, isDownloaded, onCopy, onDownload, onShowMnemonic } = useMnemonicInput({
    mnemonic: value as string,
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", width: "100%" }}>
      <OutlinedInput
        fullWidth
        multiline
        className="mnemonic-input"
        endAdornment={
          !hideOptions ? (
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
          ) : null
        }
        inputProps={{
          sx: {
            cursor: "pointer",
            filter: !isShowMnemonic && !hideOptions ? "blur(6px)" : undefined,
          },
        }}
        inputRef={ref}
        sx={{
          backgroundColor: "info.main",
          borderColor: "primary.main",
          borderWidth: "2px",
          color: "white",
          cursor: "pointer",
          fontSize: "1.5rem",
          ...rest.sx,
        }}
        type="textarea"
        value={value}
        {...rest}
      />

      <Typography sx={{ color: "error.main" }} variant="body2">
        {errorMessage}
      </Typography>

      {!hideOptions && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", my: 2, width: "100%" }}>
          <Button
            disabled={isCopied}
            sx={{ mr: 1, textTransform: "none", width: "100%" }}
            variant="outlined"
            onClick={onCopy}
          >
            {isCopied ? "Copied!" : "Copy"}
          </Button>

          <Button
            disabled={isDownloaded}
            sx={{ ml: 1, textTransform: "none", width: "100%" }}
            variant="outlined"
            onClick={onDownload}
          >
            {isDownloaded ? "Downloaded!" : "Download"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export const MnemonicInput = forwardRef<unknown, IMnemonicInputProps>(MnemonicInputUI);
