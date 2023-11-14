import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import { useEffect, useState } from "react";

import { useMarkdownHeaders } from "@src/context/MarkdownHeadersProvider";
import { useGlobalStyles } from "@src/styles";
import { handleHeadingClick } from "@src/utils";

import ConnectedIdentity from "../ConnectedIdentity";

export const RightSideBar = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const [activeHeader, setActiveHeader] = useState<string | null>(null);

  const { headers } = useMarkdownHeaders();

  useEffect(() => {
    const handleScroll = () => {
      let newActiveHeader = null;

      headers.forEach((header) => {
        const element = document.getElementById(header.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 10 && rect.top >= -10) {
            newActiveHeader = header.id;
          }
        }
      });

      setActiveHeader(newActiveHeader);
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [headers]);

  return (
    <Drawer anchor="right" className={classes.rightSideBar} variant="permanent">
      <ConnectedIdentity />

      {headers.length > 0 && (
        <List className={classes.rightSideList}>
          <Box>
            <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
              Contents
            </Typography>
          </Box>

          {headers.map((header, index) => (
            <ListItem
              key={index}
              button
              className={`${classes.rightSideListItem} 
              ${header.type === "h1" ? classes.listItemIndentationH1 : classes.listItemIndentationH2}
              ${header.id === activeHeader ? classes.rightSideListActiveHeader : ""}`}
              component="a"
              href={`#${header.id}`}
              onClick={(event) => {
                handleHeadingClick(event, header.id);
              }}
            >
              <ListItemText color="primary.main" primary={header.text} />
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
};
