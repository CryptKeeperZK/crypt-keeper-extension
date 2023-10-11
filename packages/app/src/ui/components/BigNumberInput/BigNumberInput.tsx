import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { bigintToHex } from "bigint-conversion";
import omit from "lodash/omit";
import { forwardRef, type Ref } from "react";

import { ellipsify } from "@src/util/account";
import { checkBigNumber } from "@src/util/numbers";

import type { TextFieldProps } from "@mui/material/TextField";

import { Input } from "../Input";

import { useBigNumberInput } from "./useBigNumberInput";

export interface IBigNumberInputProps extends TextFieldProps<"filled"> {
  label: string;
  errorMessage?: string;
}

const BigNumberInputUI = (
  {
    id,
    label,
    value,
    onBlur: onBlurHandler = undefined,
    onFocus: onFocusHandler = undefined,
    ...rest
  }: IBigNumberInputProps,
  inputRef: Ref<HTMLInputElement | HTMLDivElement>,
): JSX.Element => {
  const { isFocused, isInitialized, isHex, onBlur, onFocus, onToggleHex } = useBigNumberInput({
    onBlurHandler,
    onFocusHandler,
  });
  const formattedValue =
    isHex && typeof value === "string" && checkBigNumber(value) ? bigintToHex(BigInt(value), true) : (value as string);

  return (
    <Box>
      <Tooltip title={!isFocused ? formattedValue : ""}>
        <Input
          id={id}
          inputRef={isInitialized ? inputRef : undefined}
          label={label}
          value={!isFocused ? ellipsify(formattedValue) : formattedValue}
          onBlur={onBlur}
          onFocus={onFocus}
          {...omit(rest, ["ref"])}
          InputProps={{
            ...rest.InputProps,
            readOnly: isHex || rest.InputProps?.readOnly,
            endAdornment: (
              <InputAdornment position="end">
                <Typography color="primary.main" sx={{ cursor: "pointer" }} onClick={onToggleHex}>
                  {isHex ? "Dec" : "Hex"}
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      </Tooltip>
    </Box>
  );
};

export const BigNumberInput = forwardRef<HTMLInputElement | HTMLDivElement, IBigNumberInputProps>(BigNumberInputUI);
