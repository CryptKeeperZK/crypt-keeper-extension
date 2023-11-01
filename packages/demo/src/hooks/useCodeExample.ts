import { useState, useCallback, useEffect } from "react";

import { loadFile } from "@src/utils";

interface IUseCodeExampleData {
  code: string;
}

export const useCodeExample = (script: string): IUseCodeExampleData => {
  const [code, setCode] = useState("");

  const getCodeExample = useCallback(async () => {
    const codeExampleResponse = await loadFile(`./codeExamples/${script}`);
    setCode(codeExampleResponse);
  }, [setCode]);

  useEffect(() => {
    getCodeExample();
  }, [getCodeExample]);

  return {
    code,
  };
};
