import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = {
    root: {
        width: 300,
    },
    slider: {
        padding: '22px 0px',
    },
};

class MetronomeBpmSlider extends React.Component {
    state = {
        value: 3,
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <div className={classes.root}>
                <Slider
                    classes={{ container: classes.slider }}
                    value={value}
                    min={this.props.min}
                    max={this.props.max}
                    step={1}
                    onChange={this.props.onChange}
                />
            </div>
        );
    }
}

MetronomeBpmSlider.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MetronomeBpmSlider);