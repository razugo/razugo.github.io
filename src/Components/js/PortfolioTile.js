import React from 'react';

import moduleClasses from "../css/Tile.module.css";

function portfoliotile(props) {
    
    var imageSource = props.src;

    return (
        <div className={ moduleClasses.tile }>
            <img className={ moduleClasses.tileImage } src={ imageSource }/>
            <div className={ "overlay" }>
                { props.children }
            </div>
        </div>
    )
}

export default portfoliotile;