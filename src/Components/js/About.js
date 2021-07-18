import React from 'react';

import moduleclasses from '../css/About.module.css';

const about = (props) => {
    return (
        <section id="about" class="section">
            <div class="container px-lg-5"> 

                <div class="position-relative d-flex text-center mb-5">
                    <h2 class="text-24 text-light opacity-4 text-uppercase font-weight-600 w-100 mb-0">About Me</h2>
                    <p class="text-9 text-dark font-weight-600 position-absolute w-100 align-self-center line-height-4 mb-0">
                        Know Me More
                        <span class="sectionUnderline"/> 
                    </p>
                </div>


                <div class="row">
                    <div class="col-lg-8 text-center text-lg-left">
                        <h2 class="text-7 font-weight-600 mb-3">I'm <span class="text-key">Russell Wakugawa,</span> a Software Engineer</h2>
                        <p>I'm Russell, a Software Engineer who studied Computer Engineering and Computer Science at the University of 
                            Southern California. By trade I am a backend engineer, currently working at Amazon in Los Angeles, California 
                            but soon moving to Seattle, Washington . I love building and exploring new things. This website is just one of 
                            the projects I have picked up along the way. I don't know too much about web or UI design, but I hope to learn as I go.</p>
                        <p>Feel free to explore the site and connect with me over LinkedIn. Thanks for stopping by!</p>
                    </div>
                    <div class="col-lg-4 mt-5 mt-lg-0">
                        <div class="pl-4">
                            <ul className={ moduleclasses.contactList}>
                                <li class=""><span class="font-weight-600 mr-2">Name:</span>Russell Wakugawa</li>
                                <li class=""><span class="font-weight-600 mr-2">Email:</span><a href="rwakugawa@gmail.com">rwakugawa@gmail.com</a></li>
                                <li class="border-0"><span class="font-weight-600 mr-2">From:</span>Los Angeles, California</li>
                            </ul>
                            <a href="https://drive.google.com/file/d/1uWthttjlKk-A3fkQoH3kSY1DVHt45Sur/view?usp=sharing" className={ moduleclasses.resumeButton }>Download CV</a> 
                        </div>
                    </div>
                </div>

                
            </div>
        </section>
    );
}

export default about;