import React, { Component } from 'react';
//import Sound from 'react-sound';
import './Tuner.scss';

import AudioInputDevices from '../../components/AudioInputDevices/AudioInputDevices';

class Tuner extends Component{
    constructor(props){
        super(props);
        this.state = {
            sourceNode: null,
            analyser: null,
            theBuffer: null,
            DEBUGCANVAS: null,
            mediaStreamSource: null,
            waveCanvas: null,
            audioInputDevices: [],
            selectedAudioInputDeviceId: null
        };
    };

    componentDidMount = () => {
        this.consecutiveNote = {
            note: null,
            count: 0
        };
        this.rafID = null;
        this.tracks = null;
        this.buflen = 1024;
        this.buf = new Float32Array( this.buflen );
        this.MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
        this.GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be
        this.noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];


        this.audioContext = new AudioContext();
        this.MAX_SIZE = Math.max(4,Math.floor(this.audioContext.sampleRate/5000));	// corresponds to a 5kHz signal


        this.detectorElem = document.getElementById( "detector" );
        this.canvasElem = document.getElementById( "output" );
        this.DEBUGCANVAS = document.getElementById( "waveform" );
        if (this.DEBUGCANVAS) {
            this.waveCanvas = this.DEBUGCANVAS.getContext("2d");
            this.waveCanvas.strokeStyle = "black";
            this.waveCanvas.lineWidth = 1;
        }
        this.pitchElem = document.getElementById( "pitch" );
        this.noteElem = document.getElementById( "note" );
        this.detuneElem = document.getElementById( "detune" );
        this.detuneAmount = document.getElementById( "detune_amt" );

        this.detectorElem.ondragenter = function () {
            this.classList.add("droptarget");
            return false; };
        this.detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
        this.detectorElem.ondrop = function (e) {
            this.classList.remove("droptarget");
            e.preventDefault();
            this.theBuffer = null;

            var reader = new FileReader();
            reader.onload = function (event) {
                this.audioContext.decodeAudioData( event.target.result, function(buffer) {
                    this.theBuffer = buffer;
                }, function(){alert("error loading!");} );

            };
            reader.onerror = function() {
                alert("Error: " + reader.error );
            };
            reader.readAsArrayBuffer(e.dataTransfer.files[0]);
            return false;
        };



    };

    getUserMedia = (dictionary, callback) => {
        try {
            console.log('getUserMedia');
            navigator.getUserMedia =
                navigator.mediaDevices.getUserMedia ||
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;

            navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    let audioInputDevices = [];
                    devices.forEach((device) => {
                        if(device.kind === 'audioinput'){
                            audioInputDevices.push({id: device.deviceId, name: device.label});
                        }
                    });
                    this.setState({audioInputDevices: audioInputDevices});
                })
                .catch(function(error){
                    console.log(error);
                });
            navigator.mediaDevices.getUserMedia(dictionary)
                .then(function(stream) {
                    callback(stream);
                })
                .catch(function(err) {
                    alert(err);
                });
            //navigator.getUserMedia(dictionary, callback, this.error);
        } catch (e) {
            alert('getUserMedia threw exception :' + e);
        }

    };

    gotStream = (stream) => {
        // Create an AudioNode from the stream.
        let mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

        // Connect it to the destination.
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        mediaStreamSource.connect(this.analyser);
        this.updatePitch();
    };

    toggleLiveInput = () => {
        // audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        let constraints = {
            audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
                googHighpassFilter: false,
                deviceId: {
                    exact: this.state.selectedAudioInputDeviceId ? this.state.selectedAudioInputDeviceId : "default"
                }
            },
        };
        console.log(constraints);
        this.getUserMedia(constraints, this.gotStream);
    };

    noteFromPitch = (frequency) => {
        let noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return Math.round( noteNum ) + 69;
    };

    frequencyFromNoteNumber = (note) => {
        return 440 * Math.pow(2,(note-69)/12);
    };

    centsOffFromPitch = (frequency, note) => {
        return Math.floor( 1200 * Math.log( frequency / this.frequencyFromNoteNumber( note ))/Math.log(2) );
    };

    autoCorrelate = (buf, sampleRate) => {
        let SIZE = buf.length;
        let MAX_SAMPLES = Math.floor(SIZE/2);
        let best_offset = -1;
        let best_correlation = 0;
        let rms = 0;
        let foundGoodCorrelation = false;
        let correlations = new Array(MAX_SAMPLES);

        for (let i=0; i < SIZE; i++) {
            let val = buf[i];
            rms += val*val;
        }
        rms = Math.sqrt(rms/SIZE);
        if (rms<0.01) // not enough signal
            return -1;

        let lastCorrelation=1;
        for (let offset = this.MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i=0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs((buf[i])-(buf[i+offset]));
            }
            correlation = 1 - (correlation / MAX_SAMPLES);
            correlations[offset] = correlation; // store it, for the tweaking we need to do below.
            if ((correlation > this.GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
                foundGoodCorrelation = true;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            } else if (foundGoodCorrelation) {
                // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                // Now we need to tweak the offset - by interpolating between the values to the left and right of the
                // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
                // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
                // (anti-aliased) offset.

                // we know best_offset >=1,
                // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
                // we can't drop into this clause until the following pass (else if).
                let shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
                return sampleRate/(best_offset+(8*shift));
            }
            lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
            // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
            return sampleRate/best_offset;
        }
        return -1;
        //	var best_frequency = sampleRate/best_offset;
    };

    updatePitch = (time) => {
        let cycles = new Array;
        this.analyser.getFloatTimeDomainData( this.buf );
        let ac = this.autoCorrelate( this.buf, this.audioContext.sampleRate );
        // TODO: Paint confidence meter on canvasElem here.

        if (this.DEBUGCANVAS) {  // This draws the current waveform, useful for debugging
            this.waveCanvas.clearRect(0,0,512,256);
            this.waveCanvas.strokeStyle = "red";
            this.waveCanvas.beginPath();
            this.waveCanvas.moveTo(0,0);
            this.waveCanvas.lineTo(0,256);
            this.waveCanvas.moveTo(128,0);
            this.waveCanvas.lineTo(128,256);
            this.waveCanvas.moveTo(256,0);
            this.waveCanvas.lineTo(256,256);
            this.waveCanvas.moveTo(384,0);
            this.waveCanvas.lineTo(384,256);
            this.waveCanvas.moveTo(512,0);
            this.waveCanvas.lineTo(512,256);
            this.waveCanvas.stroke();
            this.waveCanvas.strokeStyle = "black";
            this.waveCanvas.beginPath();
            this.waveCanvas.moveTo(0,this.buf[0]);
            for (let i=1;i<512;i++) {
                this.waveCanvas.lineTo(i,128+(this.buf[i]*128));
            }
            this.waveCanvas.stroke();
        }

        if (ac === -1) {
            this.detectorElem.className = "vague";
            this.pitchElem.innerText = "--";
            this.noteElem.innerText = "-";
            this.detuneElem.className = "";
            this.detuneAmount.innerText = "--";
        } else {
            this.detectorElem.className = "confident";
            this.pitch = ac;

            let note =  this.noteFromPitch( this.pitch );
            let detune = this.centsOffFromPitch( this.pitch, note );

            this.noteElem.innerHTML = this.noteStrings[note%12];
            this.pitchElem.innerText = Math.round( this.pitch ) ;
            if (detune === 0 ) {
                this.detuneElem.className = "";
                this.detuneAmount.innerHTML = "--";
            } else {
                if (detune < 0)
                    this.detuneElem.className = "flat";
                else
                    this.detuneElem.className = "sharp";
                this.detuneAmount.innerHTML = Math.abs( detune );
            }
            console.log(note);
        }


        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        this.rafID = window.requestAnimationFrame( this.updatePitch );
    };

    audioInputDeviceChanged = (devideId) => {
        this.setState({selectedAudioInputDeviceId: devideId},this.toggleLiveInput);
    };

    render = () => {
        return (
            <div>
                {this.state.audioInputDevices.length > 0 &&
                    <AudioInputDevices selectedAudioInputDeviceId={this.state.selectedAudioInputDeviceId}
                                       devices={this.state.audioInputDevices}
                                       onOptionChanged={this.audioInputDeviceChanged}
                    />
                }

                <div id="detector" class="vague">
                    <div class="pitch"><span id="pitch">--</span>Hz</div>
                    <div class="note"><span id="note">--</span></div>
                    <canvas id="output" width="300" height="42"> </canvas>
                    <div id="detune">
                        <span id="detune_amt">--</span>
                        <span id="flat">cents &#9837;</span>
                        <span id="sharp">cents &#9839;</span>
                    </div>
                    <button onClick={this.toggleLiveInput} > Start Tuning </button>
                </div>
            </div>
        );
    };
}

export default Tuner;