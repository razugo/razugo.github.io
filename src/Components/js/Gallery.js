import React from 'react';

import moduleClasses from '../css/Gallery.module.css';
import clouds from '../../assets/clouds.jpg';

function gallery(props) {
    return (
        <div className={ moduleClasses.gallery }>
            <img src={ clouds }/>
        </div>
    )
}

export default gallery;