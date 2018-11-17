import React from "react";
import './Navigation.scss';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
    return (
        <div>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/matronome">Metronome</NavLink>
        </div>
    );
};

export default Navigation;