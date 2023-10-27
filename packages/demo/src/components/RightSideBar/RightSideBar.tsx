import Drawer from "@mui/material/Drawer"
import { useTheme } from "@mui/styles"
import { useGlobalStyles } from "@src/styles";
import { type PropsWithChildren } from "react"

export const LeftSideBar = ({ children }: PropsWithChildren<{}>): JSX.Element => {
    const theme = useTheme();
    const classes = useGlobalStyles(theme);

    return (
        <Drawer className={classes.rightSideBar} anchor="right" variant="permanent">
            {children}
        </Drawer>
    )
}