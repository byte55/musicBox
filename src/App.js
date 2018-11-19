import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import logo from './logo.svg';

import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';

import './App.css';
import Header from './components/Header/Header';

import Home from './views/Home/Home';
import Metronome from './views/Metronome/Metronome';
import Error from './views/Error/Error';



class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <CssBaseline/>
                    <Header />
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