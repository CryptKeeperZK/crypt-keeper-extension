import { createContext, type PropsWithChildren, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface IHeaderContext {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: string;
  id: string;
}

interface IMarkdownHeaderContext {
  headers: IHeaderContext[];
  addHeader: (header: IHeaderContext) => void;
}

// Define the context with the updated type and default values
const MarkdownHeaderContext = createContext<IMarkdownHeaderContext>({
  headers: [],
  addHeader: () => {},
});

export const MarkdownHeaderProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [headers, setHeaders] = useState<IHeaderContext[]>([]);
  const location = useLocation();

  // Listen to changes in the location
  useEffect(() => {
    setHeaders([]);
  }, [location]);

  const addHeader = (header: IHeaderContext) => {
    if (!headers.some((h) => h.id === header.id)) {
      setHeaders((prevHeaders) => [...prevHeaders, header]);
    }
  };

  return <MarkdownHeaderContext.Provider value={{ headers, addHeader }}>{children}</MarkdownHeaderContext.Provider>;
};

export const useMarkdownHeaders = (): IMarkdownHeaderContext => useContext(MarkdownHeaderContext); // <-- Return type is an array
