import React from 'react';
import classes from './Header.css';
import moduleclasses from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faDribbble, faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'

import profile from '../../assets/profile.png'

const header = (props) => {
    var primaryMenuClasses = [moduleclasses.primaryMenu, 'navbar-expand-lg', 'navbar', 'dark', 'navbar-text-light', 'border-bottom-0']
    var headerNavClasses = ['navbar-collapse', 'w-100', 'my-lg-auto']
    var navbarToggleClasses = [moduleclasses.navbarToggler]
    if(props.open) {
        headerNavClasses.push('show')
        headerNavClasses.push('expanded')
        navbarToggleClasses.push(moduleclasses.show)
    }

    return (
        <header id="header"> 
            {/* <!-- Navbar --> */}
            <nav className={ primaryMenuClasses.join(' ') } >
                <div class="container-fluid position-relative h-100 flex-lg-column pl-3 px-lg-3 pt-lg-3 pb-lg-2"> 
                    
                    {/* <!-- Logo -->  */}
                    <a href="/" class="mb-lg-auto mt-lg-4">
                        <span class="dark-2 rounded-pill p-2 mb-lg-1 d-none d-lg-inline-block">
                            <img class="img-fluid rounded-pill d-block" src={ profile } title="Russell" alt=""/>
                        </span>
                        <h1 class="text-5 text-white text-center mb-0 d-lg-block">Russell Wakugawa</h1>
                    </a> 
                    {/* <!-- Logo End --> */}
                    


                    
                    <div className={  headerNavClasses.join(' ') }>
                        <ul class="navbar-nav text-lg-center py-lg-3">
                            <li class="nav-item"><a className={ [moduleclasses.navLink, "nav-link"].join(' ') } href="#home">Home</a></li>
                            <li class="nav-item"><a className={ [moduleclasses.navLink, "nav-link"].join(' ') } href="#about">About Me</a></li>
                            <li class="nav-item"><a className={ [moduleclasses.navLink, "nav-link"].join(' ') } href="#resume">Resume</a></li>
                            <li class="nav-item"><a className={ [moduleclasses.navLink, "nav-link"].join(' ') } href="#contact">Contact</a></li>
                        </ul>
                    </div>

                    <ul className={ moduleclasses.socialIcons + " mt-lg-auto ml-auto ml-lg-0 mb-n1 d-flex"} >
                        <li className={ moduleclasses.socialIconsFacebook }><a data-toggle="tooltip" href="http://www.facebook.com/" target="_blank" title="" data-original-title="Facebook"><FontAwesomeIcon icon={faFacebook} /></a></li>
                        <li className={ moduleclasses.socialIconsTwitter  }><a data-toggle="tooltip" href="http://www.twitter.com/"  target="_blank" title="" data-original-title="Twitter"> <FontAwesomeIcon icon={faTwitter}  /></a></li>
                        <li className={ moduleclasses.socialIconsDribbble }><a data-toggle="tooltip" href="http://www.dribbble.com/" target="_blank" title="" data-original-title="Dribbble"><FontAwesomeIcon icon={faDribbble} /></a></li>
                        <li className={ moduleclasses.socialIconsGithub   }><a data-toggle="tooltip" href="http://www.google.com/"   target="_blank" title="" data-original-title="GitHub">  <FontAwesomeIcon icon={faGithub}   /></a></li>
                    </ul>
                    
                    <button className={ navbarToggleClasses.join(' ') } type="button" onClick={ props.onClick }><span></span><span></span><span></span></button>
                </div>
            </nav>
            {/* <!-- Navbar End -->  */}
        </header>
    );
}

export default header;