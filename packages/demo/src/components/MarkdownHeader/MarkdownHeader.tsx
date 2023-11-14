import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import { Children, FC, ReactNode, isValidElement, memo, useEffect } from "react";

import { useMarkdownHeaders } from "@src/context/MarkdownHeadersProvider";
import { useGlobalStyles } from "@src/styles";
import { handleHeadingClick } from "@src/utils";

interface IHeader {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: string;
  id: string;
}

interface HeaderProps {
  children: React.ReactNode;
  id: string;
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const MarkdownHeader: FC<HeaderProps> = memo(({ children, id, variant, ...rest }) => {
  const { addHeader } = useMarkdownHeaders();
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const getTextFromChildren = (child: ReactNode): string => {
    if (typeof child === "string") {
      return child;
    }

    if (isValidElement(child) && child.props.children) {
      return Children.toArray(child.props.children).map(getTextFromChildren).join("");
    }

    return "";
  };

  useEffect(() => {
    const textContent = getTextFromChildren(children);

    const header: IHeader = { type: variant, text: textContent, id };

    addHeader(header);
  }, [children, id, variant]);

  return (
    <Typography
      component={variant}
      id={id}
      variant={variant}
      onClick={(event) => {
        handleHeadingClick(event, id);
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
});
