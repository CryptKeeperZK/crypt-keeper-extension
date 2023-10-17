import { type HTMLAttributes } from "react";
import {
  type DropzoneInputProps,
  type DropzoneRootProps,
  type FileRejection,
  type Accept,
  useDropzone,
} from "react-dropzone";

export interface IUseUploadButtonArgs {
  isLoading: boolean;
  accept: Accept;
  multiple?: boolean;
  onDrop: onDropCallback;
}

export interface IUseUploadButtonData {
  isDragActive: boolean;
  acceptedFiles: File[];
  getInputProps: (props?: DropzoneInputProps) => HTMLAttributes<HTMLInputElement>;
  getRootProps: (props?: DropzoneRootProps) => HTMLAttributes<HTMLDivElement>;
}

export type onDropCallback = (acceptedFiles: File[], fileRejections: FileRejection[]) => Promise<void>;

export const useUploadButton = ({
  isLoading,
  accept,
  multiple = true,
  onDrop,
}: IUseUploadButtonArgs): IUseUploadButtonData => {
  const { isDragActive, acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept,
    disabled: isLoading,
    multiple,
    onDrop,
  });

  return {
    isDragActive,
    acceptedFiles,
    getRootProps,
    getInputProps,
  };
};
