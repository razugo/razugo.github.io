import React from 'react';

import moduleClasses from "./Tile.module.css";

function tile(props) {
    
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

export default tile;