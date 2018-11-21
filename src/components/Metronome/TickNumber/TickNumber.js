import React, {Component} from 'react';
import './TickNumber.scss';


class TickNumber extends Component {
   render(){
       let classes;
       if(this.props.isTickNumberUp){
           classes = 'TickNumber TickNumber-Up';
       } else {
           classes = 'TickNumber';
       }
       return(
           <div className={classes}>{this.props.tickNumber}</div>
       );
   }
}

export default TickNumber;

// <div className={"Ticknumber " + this.state.isTickNumberUp ? 'Ticknumber-Up' : ''}>{this.state.tickNumber}</div>