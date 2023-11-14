import { useState, useCallback, useEffect } from "react";

import { loadFile } from "@src/utils";

interface IUseCodeExampleData {
  fileContent: string;
}

export const useFileReader = (file: string): IUseCodeExampleData => {
  const [fileContent, setFileContent] = useState("");

  const getFileContent = useCallback(async () => {
    const codeExampleResponse = await loadFile(`./docs/${file}`);
    setFileContent(codeExampleResponse);
  }, [setFileContent]);

  useEffect(() => {
    getFileContent();
  }, [getFileContent]);

  return {
    fileContent,
  };
};
