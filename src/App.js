import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import logo from './logo.svg';


// Material UI
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';

import './App.css';
import NavBar from './components/NavBar/NavBar';

import Grid from '@material-ui/core/Grid';

// Views
import Home from './views/Home/Home';
import Metronome from './views/Metronome/Metronome';
import Tuner from './views/Tuner/Tuner';
import Error from './views/Error/Error';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <CssBaseline/>
                    <NavBar/>
                    <Grid container>
                        <Grid item xs={12}>
                            <Switch>
                                <Route path="/" component={Home} exact />
                                <Route path="/metronome" component={Metronome} />
                                <Route path="/tuner" component={Tuner} />
                                <Route component={Error} />
                            </Switch>
                        </Grid>
                    </Grid>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;