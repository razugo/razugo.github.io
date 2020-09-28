import React from 'react';
import classes from './Home.module.css';

import image from '../../../assets/img/squares.png';

const home = (props) => {
    return (
        <div className={ classes.home }>
            <div className={ classes.title_image }>
            {/* src="https://assets.website-files.com/583347ca8f6c7ee058111b55/5b7df8999e91310d4cf09016_layout.jpg" */}
                <img className={ classes.fill_image } src={ image }></img>

                <div className={ classes.title }>
                    <h1>Russell Wakugawa</h1>
                    <p>Software Engineer<br/></p>
                    <h4>Loves Games and Interesting Projects</h4>
                </div>
            </div>
        </div>
    );
}

export default home;