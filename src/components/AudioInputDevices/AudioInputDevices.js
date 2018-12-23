import React, { Component } from 'react';

class AudioInputDevices extends Component {
    change = (event) => {
        this.props.onOptionChanged(event.target.value);
    };

    render () {
        let devices = this.props.devices;
        let optionItems = devices.map((device) => {
            let props = {
                key: device.id,
                value: device.id,
                select: this.props.selectedAudioInputDeviceId === device.id
            };
            return(
                <option {...props}>{device.name}</option>
            );
        });

        return (
            <div>
                <select onChange={this.change}>
                    {optionItems}
                </select>
            </div>
        )
    }
}

export default AudioInputDevices;