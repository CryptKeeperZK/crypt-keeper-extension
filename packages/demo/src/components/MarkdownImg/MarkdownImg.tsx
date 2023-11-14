import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/styles";
import { useState } from "react";

import { useGlobalStyles } from "@src/styles";

export const MarkdownImg = ({ src, alt }: { src?: string; alt?: string }): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box>
      <Button
        color="inherit"
        startIcon={isExpanded ? <ArrowDropDown /> : <ArrowRight />}
        variant="text"
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? "Hide Image" : "Show Image"}
      </Button>

      {isExpanded && <img alt={alt} src={src} />}
    </Box>
  );
};
