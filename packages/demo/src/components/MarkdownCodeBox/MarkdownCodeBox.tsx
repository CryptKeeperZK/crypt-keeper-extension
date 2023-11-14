import { FC, HTMLAttributes, memo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CheckIcon from "@mui/icons-material/Check";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Box } from "@mui/material";
import { useTheme } from "@mui/styles";
import { useGlobalStyles } from "@src/styles";

type MarkdownCodeBox = {
  language: string;
  value: string;
} & HTMLAttributes<HTMLElement>;

function copyToClipboard(text: string) {
  const textarea = document.createElement("textarea");
  textarea.innerText = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export const MarkdownCodeBox: FC<MarkdownCodeBox> = memo(({ language, value }) => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    copyToClipboard(value);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000); // reset after 2 seconds
  };

  return (
    <Box style={{ position: "relative" }}>
      <SyntaxHighlighter language={language} style={vscDarkPlus}>
        {value}
      </SyntaxHighlighter>
      <Box onClick={handleCopyClick} className={classes.markdownCodeCopyBox}>
        {isCopied ? (
          <>
            <Box className={classes.markdownCodeCopiedBox}>
              Copied!
              <Box className={classes.markdownCodeCopied} />
            </Box>
            <Box className={classes.markdownCodeCopiedCheck}>
              <CheckIcon style={{ color: "white", fontSize: "18px" }} />
            </Box>
          </>
        ) : (
          <Box className={classes.markdownCodeCopy}>
            <FileCopyIcon style={{ color: "white", fontSize: "18px" }} />
          </Box>
        )}
      </Box>
    </Box>
  );
});
