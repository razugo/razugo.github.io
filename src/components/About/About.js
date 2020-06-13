import React from 'react';
import classes from './About.module.css';
import landscapeGoober from '../../assets/img/landscape_goober.jpg';

const about = (props) => {

    const aboutClasses = [classes.about];
    if(props.open) aboutClasses.push(classes.active);

    return (
        <div className={ aboutClasses.join(' ') }>
            <div className={ classes.section_narrow }> 
                <div className= { classes.pic_wrapper}>
                    <img src={ landscapeGoober } alt="some goober"/> 
                </div>
            </div>

            <div className={ classes.section_wide }>
                <h1>Why Hello There</h1>
                <p>I'm Russell, a new grad Software Engineer who studied Computer Engineering and Computer Science at the University of Southern California. By trade I am a backend engineer, currently working at Hulu in Los Angeles, California.</p>
                <p>I love building and exploring new things. This website is just one of the projects I have picked up along the way. I don't know too much about web design or UI design, but I hope to learn as I go.</p>
                <p>Feel free to explore the site and connect with me over LinkedIn or email. Thanks for stopping by :)</p>
            </div>
        </div>
    );
}

export default about;