import React from 'react';
import classes from './Header.module.css';
import Russell from '../../../assets/img/russell.jpg';
import { Link } from 'react-router-dom';

const header = (props) => {

    return (    
        <header>
            <div className={ classes.about }>
                {/*  Profile image */}
                <Link to="/">
                    <div className={ classes.cover_author_image }>
                        <img className={ classes.profile } src={ Russell } alt="Russell"></img>
                    </div>
                </Link>

                <div className={ classes.dot }></div>
                
                {/*  Name */}
                <div className={ classes.author_name }>
                    "I don't know what I don't know" -me starting a new project
                </div>

                {/*  Short Intro */}
                <div className={ classes.intro }>
                    <p>Software Engineer</p>
                    <p>Casual Tryhard</p>
                </div>
            </div>
        </header>
    );
};

export default header;