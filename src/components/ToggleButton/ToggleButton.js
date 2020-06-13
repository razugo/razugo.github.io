import React from 'react';
import classes from './ToggleButton.module.css';

const toggleButton = (props) => {

    const buttonClasses = [classes.button];
    if(props.open) buttonClasses.push(classes.active);

    return (
        <div className={ [classes.nav_left, classes.visible_xs].join(' ')} onClick={ props.onClick }>
            <div className={ buttonClasses.join(' ') }>
                <div className={ [classes.bar, classes.top].join(' ') }></div>
                <div className={ [classes.bar, classes.middle].join(' ') }></div>
                <div className={ [classes.bar, classes.bottom].join(' ') }></div>
            </div>
        </div>
    );
}

export default toggleButton;