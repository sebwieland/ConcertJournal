import { jsx as _jsx } from "react/jsx-runtime";
import { styled } from "@mui/material/styles";
import { LeadingActions, SwipeableListItem, SwipeAction, TrailingActions, } from "react-swipeable-list";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
const StyledSwipeAction = styled(SwipeAction)(({ theme }) => ({
    padding: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%", // Limit width to show only when swiped
    zIndex: 0,
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
    },
}));
const StyledSwipeActionDelete = styled(SwipeAction)(({ theme }) => ({
    padding: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%", // Limit width to show only when swiped
    zIndex: 0,
    "&:hover": {
        backgroundColor: theme.palette.error.dark,
    },
}));
export const StyledSwipeableListItem = styled(SwipeableListItem)(() => ({
    width: "100%",
    position: "relative",
}));
export const leadingActions = (action, id) => (_jsx(LeadingActions, { children: _jsx(StyledSwipeActionDelete, { onClick: () => action(id), children: _jsx(DeleteIcon, { sx: { fontSize: 24 } }) }) }));
export const trailingActions = (action, id) => (_jsx(TrailingActions, { children: _jsx(StyledSwipeAction, { onClick: () => action(id), children: _jsx(EditIcon, { sx: { fontSize: 24 } }) }) }));
//# sourceMappingURL=SwipeableListItem.js.map