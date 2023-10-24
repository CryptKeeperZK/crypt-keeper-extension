import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import ButtonGroup, { type ButtonGroupProps } from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";

import { useDropdownButton } from "./useDropdownButton";

export interface IDropdownButtonProps extends Omit<ButtonGroupProps, "onClick"> {
  options: IDropdownButtonOption[];
  disabled?: boolean;
  onClick: (index: number) => void;
}

export interface IDropdownButtonOption {
  id: string;
  title: string;
  checkDisabledItem?: (index: number) => boolean;
}

const DropdownButton = ({ disabled = false, options, onClick, ...rest }: IDropdownButtonProps): JSX.Element => {
  const { isMenuOpen, menuRef, selectedIndex, onToggleMenu, onMenuItemClick, onSubmit } = useDropdownButton({
    onClick,
  });

  return (
    <>
      <ButtonGroup ref={menuRef} variant="contained" {...rest} sx={{ ml: 1, width: "70%", ...rest.sx }}>
        <Button
          data-testid="dropdown-button"
          disabled={disabled}
          size="small"
          sx={{ textTransform: "none", flex: 1 }}
          onClick={onSubmit}
        >
          {options[selectedIndex].title}
        </Button>

        <Button data-testid="dropdown-menu-button" size="small" sx={{ width: 5 }} onClick={onToggleMenu}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Popper
        disablePortal
        transition
        anchorEl={menuRef.current}
        open={isMenuOpen}
        role={undefined}
        sx={{
          zIndex: 1,
        }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: "center top",
            }}
          >
            <Paper
              data-testid="menu-paper"
              sx={{
                backgroundColor: "text.800",
              }}
            >
              <ClickAwayListener onClickAway={onToggleMenu}>
                <MenuList autoFocusItem id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.id}
                      data-testid={`dropdown-menu-item-${index}`}
                      disabled={option.checkDisabledItem?.(index)}
                      selected={index === selectedIndex}
                      onClick={() => {
                        onMenuItemClick(index);
                      }}
                    >
                      <Typography color="common.white">{option.title}</Typography>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default DropdownButton;
