import React from 'react';
import { Parallax, Background } from 'react-parallax';
import ReactTypingEffect from 'react-typing-effect';

import classes from './Home.css';
import moduleClasses from './Home.module.css';

import bridge from '../../../assets/bridge.jpg';

const home = (props) => {
    return (
        <Parallax 
            strength={500}
            bgImage={ bridge } 
            bgImageAlt="Default Background" 
            className={ moduleClasses.background }
        >
            <div className={ moduleClasses.parallaxCover }></div>

            <div id="home" className={ moduleClasses.parallaxTile }>
                <div class="hero-content section d-flex fullscreen">
                    <div class="container my-auto">
                        <div class="row">
                            <div class="col-12 text-center">
                                <p class="text-7 font-weight-500 text-white mb-2 mb-md-3">Welcome</p>
                                <h2 class="text-16 font-weight-600 text-white mb-2 mb-md-3">
                                    <span class="typed"> I'm&nbsp;
                                        <ReactTypingEffect
                                        text={ ["an Engineer", "a Gamer", "Russell Wakugawa", "hungry."] }
                                        typingDelay={ 0 }
                                        speed={ 100 }
                                        eraseSpeed={ 50 }
                                        eraseDelay={ 750 }
                                        />
                                    </span>
                                </h2>
                                <p class="text-5 text-light mb-4">based in Los Angeles, California.</p>
                            </div>
                        </div>
                    </div>
                    <a href="l#about" class="scroll-down-arrow text-white smooth-scroll"><span class="animated"><i class="fa fa-chevron-down"></i></span></a> 
                </div>
            </div>

        </Parallax>
    );
}

export default home;