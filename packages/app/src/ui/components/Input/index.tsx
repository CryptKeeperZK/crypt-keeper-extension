import Box from "@mui/material/Box";
import FormGroup from "@mui/material/FormGroup";
import { lighten } from "@mui/material/styles";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import classNames from "classnames";
import { forwardRef, type Ref } from "react";

import "./input.scss";

export interface IInputProps extends TextFieldProps<"filled"> {
  label: string;
  readOnly?: boolean;
  endLabelIcon?: React.ReactNode;
  errorMessage?: string;
}

const InputUI = (
  {
    id,
    label,
    endLabelIcon = undefined,
    className,
    errorMessage = "",
    inputRef = undefined,
    ...inputProps
  }: IInputProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => (
  <Box className={classNames("input-group", className)} sx={{ width: "100%" }}>
    {endLabelIcon && (
      <Box sx={{ alignItems: "center", justifyContent: "flex-end", display: "flex", mb: 1 }}>
        <Box sx={{ color: "primary.main" }}>{endLabelIcon}</Box>
      </Box>
    )}

    <FormGroup>
      <TextField
        ref={inputRef || ref}
        fullWidth
        error={Boolean(errorMessage)}
        id={id}
        label={label}
        {...inputProps}
        sx={{
          ...inputProps.sx,
          backgroundColor: lighten("#000", 0.15),
          borderRadius: 1,
        }}
      />
    </FormGroup>

    <Typography color="error.main" fontSize="xs" sx={{ my: 1 }} textAlign="left">
      {errorMessage}
    </Typography>
  </Box>
);

export const Input = forwardRef<HTMLInputElement, IInputProps>(InputUI);
