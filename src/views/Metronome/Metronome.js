import React, { Component } from 'react';
//import Sound from 'react-sound';
import './Metronome.scss';


import Grid from '@material-ui/core/Grid';
//import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
//import Slider from '@material-ui/lab/Slider';

import TickSound from './Tracks/tick.flac';
import TickSoundUp from './Tracks/tickUp.flac';
import TickNumber from './../../components/Metronome/TickNumber/TickNumber';

import MetronomeButton from '../../components/Metronome/Button';

class Metronome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tickNumber: 1,
            tickUpNumbers: [1],
            maxTickNumber: 4,
            bpm: localStorage.getItem('bpm') || 120,
            isPlaying: false,
            isTickNumberUp: true,
            playStatus: 'STOPPED',
        };
        console.log('storage BPM',localStorage.getItem('bpm'));

        this.tickSound = new Audio(TickSound);
        this.tickSoundUp = new Audio(TickSoundUp);
    }

    componentWillUnmount = () => {
        this.setState({isPlaying: false});
        localStorage.setItem('bpm',this.state.bpm);

    };

    tick = () => {
        let tickNumber = this.state.tickNumber + 1;
        if(tickNumber > 4){
            tickNumber = 1;
        }

        if(this.state.tickUpNumbers.indexOf(tickNumber) >= 0){
            this.tickSoundUp.play();
            this.setState({isTickNumberUp: true});
        } else {
            this.tickSound.play();
            this.setState({isTickNumberUp: false});
        }

        this.setState({tickNumber: tickNumber});
    };

    setTick = () => {
        console.log(this.state.isPlaying);
        clearInterval(this.timerID);
        if(this.state.isPlaying){
            if(!isNaN(this.state.bpm) && this.state.bpm > 0){
                this.timerID = setInterval(
                    () => this.tick(),
                    Math.floor(60000 / this.state.bpm)
                );
            }
        }
    };

    play = () => {
        let isPlaying = !this.state.isPlaying;
        console.log('Play Button Pressed');
        console.log(isPlaying);
        this.setState({
            isPlaying: isPlaying,
            tickNumber: 1

        },this.setTick);
    };

    handleBPMChange = (bpm) => {
        bpm = parseInt(bpm);
        this.setState({bpm: bpm},this.setTick);
        localStorage.setItem('bpm',bpm);
    };

    changeBPMInput = event => {
        console.log('BPM changed: ' + event.target.value);
        let newBPM = parseInt(event.target.value.replace(/[^\\d]/,''));
        console.log(newBPM,event.target.value.replace(/[^\d]/,''));
        if(newBPM < 0 || newBPM === 'NaN'){
            newBPM = 0;
        }
        this.handleBPMChange(newBPM);
    };

    changeBPMSlider = (event, value) => {
        this.handleBPMChange(value);
    };

    changeBPMButton = event => {
        let value = parseInt(event.currentTarget.getAttribute('value'));
        let absolute = Math.abs(value);
        let currentValue = this.state.bpm;
        let newBPM = 0;

        if(currentValue === ''){
            currentValue = 0;
        }

        if(value > 0 ){
            newBPM = currentValue + absolute;
        } else if(value < 0 ){
            newBPM = currentValue - absolute;
        }

        console.log(newBPM,currentValue,absolute);
        if(newBPM < 0 ){
            newBPM = 0;
        }

        console.log(newBPM,currentValue,absolute);
        this.handleBPMChange(newBPM);
    };

    render = () => {
        return (
            <Grid container justify="center" alignItems="center">
                <Grid item xs={12} md={6}>
                    <Grid container spacing={8}>
                        <Grid item xs={12} >
                            <TickNumber isTickNumberUp={this.state.isTickNumberUp} tickNumber={this.state.tickNumber}/>
                        </Grid>
                        <Grid item xs={2}>
                            <Grid container justify={"center"} spacing={8}>
                                <Grid item xs={12}>
                                    <MetronomeButton text={"-1"}
                                                     value={-1}
                                                     onClick={this.changeBPMButton}
                                                     fullWidth={true}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <MetronomeButton text={"-5"}
                                                     value={-5}
                                                     onClick={this.changeBPMButton}
                                                     fullWidth={true}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                id="outlined-bare"
                                value={this.state.bpm}
                                margin="normal"
                                variant="outlined"
                                fullWidth
                                label="beats per minute"
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Grid container justify={"center"} spacing={8}>
                                <Grid item xs={12}>
                                    <MetronomeButton text={"+1"}
                                                     value={1}
                                                     onClick={this.changeBPMButton}
                                                     fullWidth={true}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <MetronomeButton text={"+5"}
                                                     value={5}
                                                     onClick={this.changeBPMButton}
                                                     fullWidth={true}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={12}>
                            <MetronomeButton text={this.state.isPlaying ? 'Stop' : 'Start'}
                                             onClick={this.play}
                                             fullWidth={true}
                            />
                        </Grid>
                    </Grid>
                    {/*
                    <br /><br />
                    <Grid container>
                        <Grid item xs={12}>
                            <div>

                                <Slider
                                    value={this.state.bpm}
                                    aria-labelledby="label"
                                    min={20}
                                    max={220}
                                    step={1}
                                    onChange={this.changeBPMSlider} />
                            </div>
                        </Grid>
                    </Grid>
                    */}
                </Grid>
            </Grid>
        );
    };
}

export default Metronome;