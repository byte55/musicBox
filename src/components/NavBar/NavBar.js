import React from 'react';

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import './NavBar.scss';

const NavBar = () => {
    return(
        <AppBar position={"static"}>
            <Toolbar>
                <Typography variant={"title"} color={"inherit"}>
                    Musician Toolbox
                    &nbsp;&nbsp;&nbsp;
                    <a href={"/"}>Home</a>&nbsp;&nbsp;
                    <a href={"/metronome"}>Metronome</a>
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;