import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { forwardRef, Ref, type HTMLAttributes } from "react";

import type { Accept } from "react-dropzone";

import { type onDropCallback, useUploadButton } from "./useUploadButton";

export interface IUploadButtonProps extends Omit<HTMLAttributes<HTMLInputElement>, "onDrop"> {
  isLoading?: boolean;
  errorMessage?: string;
  multiple?: boolean;
  accept: Accept;
  name: string;
  onDrop: onDropCallback;
}

const UploadButtonUI = (
  { isLoading = false, multiple = true, errorMessage = "", accept, name, onDrop, ...rest }: IUploadButtonProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => {
  const { isDragActive, getRootProps, getInputProps } = useUploadButton({
    isLoading,
    accept,
    multiple,
    onDrop,
  });

  const fileTitle = multiple ? "files" : "file";

  return (
    <Box {...rest} {...getRootProps({ className: "dropzone" })} sx={{ width: "100%" }}>
      <input ref={ref} name={name} {...getInputProps()} />

      <Button sx={{ width: "100%" }} variant="outlined">
        {isDragActive ? `Drop the ${fileTitle} here...` : `Upload ${fileTitle}`}
      </Button>

      <Typography color="error" sx={{ mt: 1, mx: 1, fontSize: "0.8125rem" }} variant="body2">
        {errorMessage}
      </Typography>
    </Box>
  );
};

export const UploadButton = forwardRef<HTMLInputElement, IUploadButtonProps>(UploadButtonUI);
