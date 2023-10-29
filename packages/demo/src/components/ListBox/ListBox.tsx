import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { type IListComponents } from "@src/constants";

interface IListBoxProps {
  listComponents: IListComponents;
}

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
    <Box>
      <ListItemButton
        component="a"
        href="#customized-list"
        sx={{
          px: 3,
          pt: 2.5,
          pb: isShowList ? 0 : 2.5,
          "&:hover, &:focus": { "& svg": { opacity: isShowList ? 1 : 0 } },
        }}
        onClick={handleShowList}
      >
        <ListItemText
          primary={listComponents.header.title}
          primaryTypographyProps={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 0,
          }}
          sx={{ my: 0 }}
        />

        <KeyboardArrowDown
          sx={{
            mr: -1,
            opacity: 0,
            transform: isShowList ? "rotate(-180deg)" : "rotate(0)",
            transition: "0.2s",
          }}
        />
      </ListItemButton>

      {isShowList &&
        listComponents.subHeader.map((subHeader) => (
          <Box
            key={subHeader.title}
            sx={{
              bgcolor: "rgba(71, 98, 130, 0.2)",
              pb: 2,
            }}
          >
            <ListItemButton key={subHeader.title} alignItems="flex-start">
              <ListItemText
                key={subHeader.title}
                primary={subHeader.title}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: "medium",
                  lineHeight: "20px",
                  mb: "2px",
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  fontSize: 12,
                  lineHeight: "16px",
                  color: "rgba(0,0,0,0)",
                }}
                sx={{ my: 0 }}
              />
            </ListItemButton>

            {subHeader.items.map((item) => (
              <ListItemButton
                key={item.title}
                sx={{ py: 0, minHeight: 32, color: "rgba(255,255,255,.8)" }}
                onClick={() => {
                  goToPage(item.path);
                }}
              >
                <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }} />
              </ListItemButton>
            ))}
          </Box>
        ))}
    </Box>
  );
};
