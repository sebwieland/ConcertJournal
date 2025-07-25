import {styled} from "@mui/material/styles";
import {LeadingActions, SwipeableListItem, SwipeAction, TrailingActions} from "react-swipeable-list";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import * as React from "react";

const StyledSwipeAction = styled(SwipeAction)(({theme}) => ({
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%', // Limit width to show only when swiped
    zIndex: 0,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const StyledSwipeActionDelete = styled(SwipeAction)(({theme}) => ({
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%', // Limit width to show only when swiped
    zIndex: 0,
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
    },
}));

export const StyledSwipeableListItem = styled(SwipeableListItem)(() => ({
    width: '100%',
    position: 'relative',
}));

export const leadingActions = (action: any, id: number) => (
    <LeadingActions>
        <StyledSwipeActionDelete onClick={() => action(id)}>
            <DeleteIcon sx={{fontSize: 24}}/>
        </StyledSwipeActionDelete>
    </LeadingActions>
);

export const trailingActions = (action: any, id: number) => (
    <TrailingActions>
        <StyledSwipeAction onClick={() => action(id)}>
            <EditIcon sx={{fontSize: 24}}/>
        </StyledSwipeAction>
    </TrailingActions>
);

