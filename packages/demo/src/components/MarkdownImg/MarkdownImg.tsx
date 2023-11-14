import { ArrowDropDown, ArrowRight, Visibility, VisibilityOffOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/styles";
import { useGlobalStyles } from "@src/styles";
import { useState } from "react";

export const MarkdownImg = ({ src, alt }: { src?: string; alt?: string }): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box>
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="text"
        color="inherit"
        startIcon={isExpanded ? <ArrowDropDown /> : <ArrowRight />}
      >
        {isExpanded ? "Hide Image" : "Show Image"}
      </Button>
      {isExpanded && <img src={src} alt={alt} />}
    </Box>
  );
};
