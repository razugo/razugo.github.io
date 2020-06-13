import React from 'react';
import classes from './Home.module.css';

import image from '../../assets/img/bali.jpg';

const home = (props) => {
    return (
        <div className={ classes.home }>
            <div className={ classes.title_image }>
                <img className={ classes.fill_image }src="https://assets.website-files.com/583347ca8f6c7ee058111b55/5b7df8999e91310d4cf09016_layout.jpg"></img>
            </div>
        </div>
    );
}

export default home;