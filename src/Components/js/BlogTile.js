import React from 'react';

import moduleClasses from '../css/BlogTile.module.css';

const blogtile = (props) => {
    const image = require( '../../assets/' + props.image );
    return (
        <div className={ moduleClasses.post + " bg-white border rounded mb-4" }>
            <a className={ moduleClasses.postThumbnail } href={ image.default }>
                <img src={ image } />
            </a>
            
            <div className={ moduleClasses.postContent }>
                <h2 className={ moduleClasses.postTitle }><a href={ props.link }>{ props.title }</a></h2>
                <p>{ props.description }</p>
                <span className={ moduleClasses.postDate }>{ props.date }&nbsp;&nbsp;&nbsp;—&nbsp;</span>
                <span className={ moduleClasses.postWords }>{ props.length } minute read</span>
            </div>
        </div>
    );
}

export default blogtile;