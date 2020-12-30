import React from 'react';
import moduleClasses from '../css/Footer.module.css';

const footer = (props) => {
    return (
        <footer id="footer" class="section">
            <div class="container px-lg-5">
                <div class="row">
                    <div class="col-lg-6 text-center text-lg-left">
                        <p class="mb-3 mb-lg-0">Copyright © 2020 <a href="/" className={ moduleClasses.navLink }>Russell</a>. All Rights Reserved.</p>
                    </div>
                    <div class="col-lg-6">
                        <ul class="nav nav-separator justify-content-center justify-content-lg-end">
                            <li class="nav-item"> <a className={ [moduleClasses.navLink, "nav-link"].join(' ') } data-toggle="modal" data-target="#terms-policy" href="/">Terms &amp; Policy</a></li>
                            <li class="nav-item"> <a className={ [moduleClasses.navLink, "nav-link"].join(' ') } data-target="#disclaimer" href="/">Disclaimer</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default footer;