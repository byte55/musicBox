import React from 'react';
import Button from '@material-ui/core/Button';

function MetronomeButton(props) {
    return (
        <Button variant="contained"
                color="primary"
                value={props.value}
                onClick={props.onClick}
                fullWidth={props.fullWidth}

        >
            {props.text}
        </Button>
    );
}

export default MetronomeButton;