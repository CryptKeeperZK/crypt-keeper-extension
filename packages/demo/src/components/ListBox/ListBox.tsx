import { KeyboardArrowRight } from "@mui/icons-material";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Collapse } from "react-collapse";
import { useNavigate } from "react-router-dom";

import { type IListComponents } from "@src/constants";

interface IListBoxProps {
  listComponents: IListComponents;
}

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 3,
  py: 2,
  fontSize: 18,
  fontWeight: 600,
  "&:hover, &:focus": { bgcolor: "rgba(0, 0, 0, 0.9)" },
};

const arrowStyle = (isShowList: boolean) => ({
  mr: 2,
  transform: isShowList ? "rotate(90deg)" : "rotate(0deg)",
  transition: "0.2s",
});

const subHeaderStyle = {
  px: 3,
  py: 1,
  fontSize: 15,
  position: "relative",
};

const indicatorStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  bgcolor: "grey",
  mr: 2,
  position: "absolute",
  transform: "translateY(-50%)",
  left: 2,
  top: "50%",
};

const itemStyle = {
  px: 4,
  py: 1,
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: 13,
  "&:hover, &:focus": { bgcolor: "rgba(255, 255, 255, 0.05)" },
  borderLeft: "2px solid white",
  marginLeft: 5,
};

export const ListBox = ({ listComponents }: IListBoxProps): JSX.Element => {
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
    <Box sx={{ borderRadius: 2 }}>
      <ListItemButton component="a" href="#customized-list" sx={headerStyle} onClick={handleShowList}>
        <KeyboardArrowRight sx={arrowStyle(isShowList)} />

        <ListItemText primary={listComponents.header.title} />
      </ListItemButton>

      <Collapse
        isOpened={isShowList}
        style={{
          transition: "height 500ms",
        }}
      >
        {listComponents.subHeader.map((subHeader) => (
          <Box key={subHeader.title} sx={subHeaderStyle}>
            <ListItemButton disabled>
              <Box sx={indicatorStyle} />

              <ListItemText primary={subHeader.title} />
            </ListItemButton>

            {subHeader.items.map((item) => (
              <ListItemButton
                key={item.title}
                sx={itemStyle}
                onClick={() => {
                  goToPage(item.path);
                }}
              >
                <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }} />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};
