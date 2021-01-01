import React from 'react';

import moduleClasses from "../css/PortfolioTile.module.css";

function portfoliotile(props) {
    
    var imageSource = props.src;

    return (
        <div className={ "col-md-6 col-lg-4 mb-4 " }>
            <div className={ moduleClasses.tile }>
                <div className={ moduleClasses.tileImageContainer }>
                    <img className={ moduleClasses.tileImage } src={ imageSource }/>
                </div>
                
                <div className={ moduleClasses.overlayContainer }>
                    <div className={ moduleClasses.overlay }>
                        <h5 class="text-white font-weight-400"> { props.title } </h5>
                        <span class="text-light">{ props.technology }</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default portfoliotile;