import { KeyboardArrowRight } from "@mui/icons-material";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/styles";
import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Collapse } from "react-collapse";
import { useNavigate } from "react-router-dom";

import { type IListComponents } from "@src/constants";
import { useGlobalStyles } from "@src/styles";

interface IListBoxProps {
  listComponents: IListComponents;
}

export const ListBox = ({ listComponents }: IListBoxProps): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const navigate = useNavigate();

  const [isShowList, setIsShowList] = useState(true);

  const handleShowList = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      setIsShowList((isShow) => !isShow);
    },
    [setIsShowList],
  );

  const goToPage = useCallback(
    (path?: string) => {
      if (path) {
        navigate(path);
      }
    },
    [navigate],
  );

  return (
    <Box className={classes.listBox}>
      <ListItemButton className={classes.listBoxHeader} component="a" onClick={handleShowList}>
        <KeyboardArrowRight className={`${classes.listBoxArrow} ${isShowList ? classes.listBoxArrowRotated : ""}`} />

        <ListItemText className={classes.listBoxItemHeaderText} primary={listComponents.header.title} />
      </ListItemButton>

      <Collapse isOpened={isShowList}>
        {listComponents.subHeader?.map((subHeader) => (
          <Box key={subHeader.title}>
            <Box className={classes.listBoxSubHeader}>
              <ListItemButton disabled>
                <ListItemText className={classes.listBoxItemItemText} primary={subHeader.title} />
              </ListItemButton>
            </Box>

            {subHeader.items.map((item) => (
              <Box key={item.title} className={classes.listBoxItem}>
                <ListItemButton
                  key={item.title}
                  className={classes.listBoxItem}
                  onClick={() => {
                    goToPage(item.path);
                  }}
                >
                  <ListItemText className={classes.listBoxItemItemText} primary={item.title} />
                </ListItemButton>
              </Box>
            ))}
          </Box>
        ))}

        {listComponents.items?.map((item) => (
          <Box key={item.title} className={classes.listBoxItem}>
            <ListItemButton
              key={item.title}
              onClick={() => {
                goToPage(item.path);
              }}
            >
              <ListItemText className={classes.listBoxItemItemText} primary={item.title} />
            </ListItemButton>
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};
