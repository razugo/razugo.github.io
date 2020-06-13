import React from 'react';
import classes from './Footer.module.css'

const footer = (props) => {

    return (    
        <footer className={ classes.footer }>
            <section className={ classes.contact }>
                <h3 className={ classes.contact_title }>Contact me</h3>
                    <ul>
                        <li className="github">
                            <a href="https://github.com/razugo" target="_blank">
                                <i className="fa fa-github"></i>
                            </a>
                        </li>
                        <li className="linkedin">
                            <a href="https://www.linkedin.com/in/russell-wakugawa-43799b117/" target="_blank">
                                <i className="fa fa-linkedin"></i>
                            </a>
                        </li>
                        <li>
                            <a href="mailto:rwakugawa@gmail.com">
                                <i className=" fa fa-envelope-o" aria-hidden="true"></i>
                            </a>
                            
                        </li>
                    </ul>
            </section>
        </footer>
    );
};

export default footer;