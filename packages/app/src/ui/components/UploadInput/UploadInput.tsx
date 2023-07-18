import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { forwardRef, Ref, type HTMLAttributes } from "react";

import type { Accept } from "react-dropzone";

import { onDropCallback, useUploadInput } from "./useUploadInput";

export interface IUploadInputProps extends Omit<HTMLAttributes<HTMLInputElement>, "onDrop"> {
  isLoading?: boolean;
  errorMessage?: string;
  multiple?: boolean;
  accept: Accept;
  onDrop: onDropCallback;
}

export const UploadInputUI = (
  { isLoading = false, multiple = true, errorMessage = "", accept, onDrop, ...rest }: IUploadInputProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => {
  const { isDragActive, acceptedFiles, getRootProps, getInputProps } = useUploadInput({
    isLoading,
    accept,
    multiple,
    onDrop,
  });

  const fileTitle = multiple ? "files" : "file";

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        {...getRootProps({ className: "dropzone" })}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 3,
          py: 8,
          borderWidth: 2,
          borderRadius: 2,
          borderStyle: "dashed",
          outline: "none",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <input ref={ref} {...rest} {...getInputProps()} />

        {isDragActive ? <p>Drop the {fileTitle} here...</p> : <p>Drop some {fileTitle} here, or click to select</p>}
      </Box>

      <Typography color="error" sx={{ mt: 1, mx: 1, fontSize: "0.8125rem" }} variant="body2">
        {errorMessage}
      </Typography>

      <List>
        {acceptedFiles.map((file) => (
          <ListItem key={file.name}>{`${file.name} - ${file.size} bytes`}</ListItem>
        ))}
      </List>
    </Box>
  );
};

export const UploadInput = forwardRef<HTMLInputElement, IUploadInputProps>(UploadInputUI);
