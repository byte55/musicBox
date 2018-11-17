import React from 'react';
import './Header.scss';

import Navigation from './Navigation/Navigation';

class Header extends React.Component {
    render() {
        return (
            <header>
                <Navigation />
            </header>
        );
    }
}
export default Header;