import React from 'react';

import moduleClasses from '../css/Gallery.module.css';
import clouds from '../../assets/clouds.jpg';

const temp = [
    {
        'src': '',
        'title': ''
    }
];

var slideIndex = 0;

function gallery(props) {

    // function carousel() {
    //     var i;
    //     var x = document.getElementsByClassName("mySlides");
    //     for (i = 0; i < x.length; i++) {
    //       x[i].style.display = "none";
    //     }
    //     slideIndex++;
    //     if (slideIndex > x.length) {slideIndex = 1}
    //     x[slideIndex-1].style.display = "block";
    //     setTimeout(carousel, 2000); // Change image every 2 seconds
    // }
    // carousel();

    return (
        <div className={ moduleClasses.gallery }>
            <img src={ clouds }/>
        </div>
    )
}

export default gallery;