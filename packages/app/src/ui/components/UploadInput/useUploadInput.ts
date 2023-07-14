import { type HTMLAttributes } from "react";
import {
  type DropzoneInputProps,
  type DropzoneRootProps,
  type FileRejection,
  type DropEvent,
  type Accept,
  useDropzone,
} from "react-dropzone";

export interface IUseUploadInputArgs {
  isLoading: boolean;
  accept: Accept;
  multiple?: boolean;
  onDrop: onDropCallback;
}

export interface IUseUploadInputData {
  isDragActive: boolean;
  acceptedFiles: File[];
  getInputProps: (props?: DropzoneInputProps) => HTMLAttributes<HTMLInputElement>;
  getRootProps: (props?: DropzoneRootProps) => HTMLAttributes<HTMLDivElement>;
}

export type onDropCallback = (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;

export const useUploadInput = ({
  isLoading,
  accept,
  multiple = true,
  onDrop,
}: IUseUploadInputArgs): IUseUploadInputData => {
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
