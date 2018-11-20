import React, { Component } from 'react';
import Sound from 'react-sound';
import './Metronome.scss';


import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import TickSound from './Tracks/tick.flac';
import TickSoundUp from './Tracks/tickUp.flac';

class Metronome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tickNumber: 1,
            tickUpNumbers: [1],
            maxTickNumber: 4,
            bpm: 120,
            isPlaying: false,
            playStatus: 'STOPPED',
            tickSound: TickSoundUp
        };
    }

    componentWillUnmount = () => {
        this.setState({isPlaying: false});
    };

    tick = () => {
        let newStates = {};
        let tickNumber = this.state.tickNumber + 1;
        if(tickNumber > 4){
            tickNumber = 1;
        }

        if(this.state.tickUpNumbers.indexOf(tickNumber) >= 0){
            newStates = {
                tickNumber: tickNumber,
                tickSound: TickSoundUp
            }
        } else {
            newStates = {
                tickNumber: tickNumber,
                tickSound: TickSound
            }
        }

        if(newStates.tickSound === this.state.tickSound){
            delete newStates.tickSound;
        }

        this.setState(newStates);
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
        let playStatus = isPlaying ? 'PLAYING' : 'STOPPED';
        console.log('Play Button Pressed');
        console.log(isPlaying);
        this.setState({
            isPlaying: isPlaying,
            playStatus: playStatus

        },this.setTick);
    };

    changeBPMInput = event => {
        console.log('BPM changed: ' + event.target.value);
        let newValue = parseInt(event.target.value.replace(/[^\\d]/,''));
        console.log(newValue,event.target.value.replace(/[^\d]/,''));
        if(newValue < 0 || newValue === 'NaN'){
            newValue = 0;
        }
        this.setState({bpm: newValue},this.setTick);
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

        this.setState({
            bpm: newBPM
        },this.setTick);

    };

    render = () => {
        return (
            <Grid container justify="center" alignItems="center" xs={12}>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={this.changeBPMButton} value={-5}>-5</Button>
                    <div className="tickNumber up">{this.state.tickNumber}</div>
                    <Button variant="contained" color="primary" onClick={this.changeBPMButton} value={5}>+5</Button>

                    <input className={"bpm"} onChange={this.changeBPMInput} value={this.state.bpm}/>

                    <Sound url={this.state.tickSound} playStatus={this.state.playStatus} autoLoad ignoreMobileRestrictions />
                    <Button variant="contained" color="primary" onClick={this.play}>{this.state.isPlaying ? 'Stop' : 'Start'}</Button>
                </Grid>
            </Grid>
        );
    };
}
export default Metronome;