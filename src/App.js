import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import logo from './logo.svg';


// Material UI
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';

import './App.css';
import NavBar from './components/NavBar/NavBar';

// Views
import Home from './views/Home/Home';
import Metronome from './views/Metronome/Metronome';
import Error from './views/Error/Error';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <CssBaseline/>
                    <NavBar/>
                    <Switch>
                        <Route path="/" component={Home} exact />
                        <Route path="/matronome" component={Metronome} />
                        <Route component={Error} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;