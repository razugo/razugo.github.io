import React from 'react';

import classes from './Home.module.css';

import image from '../../assets/img/bali.jpg';
// import image from '../../assets/img/huh.jpg';

const home = (props) => {
    const style = {
        backgroundImage: "url(" + image + ")"
    }
    return (
        <div className={ classes.home }>
            <div className={ classes.background_image } style={ style }>
                
            </div>

            <div className={ classes.caption }>
                    {/* <div className={ classes.border }> */}
                        <h3>"This website is my playground</h3>
                        <h3> Take a look and enjoy the view!"</h3>
                        <h3>- A Backend Engineer</h3>
                    {/* </div> */}
            </div>

            <div className={ classes.section }>
                <h3>
                    Parallax Demo
                </h3>
                <p>
                    Parallax scrolling is a web site trend where the background content is moved at a different speed than the foreground content while scrolling. Nascetur per nec posuere turpis, lectus nec libero turpis nunc at, sed posuere mollis ullamcorper libero ante lectus, blandit pellentesque a, magna turpis est sapien duis blandit dignissim. Viverra interdum mi magna mi, morbi sociis. Condimentum dui ipsum consequat morbi, curabitur aliquam pede, nullam vitae eu placerat eget et vehicula. Varius quisque non molestie dolor, nunc nisl dapibus vestibulum at, sodales tincidunt mauris ullamcorper, dapibus pulvinar, in in neque risus odio. Accumsan fringilla vulputate at quibusdam sociis eleifend, aenean maecenas vulputate, non id vehicula lorem mattis, ratione interdum sociis ornare. Suscipit proin magna cras vel, non sit platea sit, maecenas ante augue etiam maecenas, porta porttitor placerat leo.
                </p>
            </div>
        </div>
    );
}

export default home;