import {Fab} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {useNavigate} from "react-router-dom";

const AddButton = () => {
    const navigate = useNavigate();

    return (
        <Fab
            color="primary"
            aria-label="add"
            onClick={() => navigate('/new-entry')}
            sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
            }}
        >
            <AddIcon/>
        </Fab>
    );
};

export default AddButton;