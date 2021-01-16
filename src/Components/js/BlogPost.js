import React from 'react';

import moduleClasses from '../css/BlogPost.module.css';

const ReactMarkdownWithHtml = require('react-markdown/with-html')

const MyImage = props => {
    const image = require( '../../assets/' + props.src );
    return (
      <img
        alt={ props.alt }
        src={ image.default }
      />
    );
  };

class BlogPost extends React.Component {
    
    render() {
        console.log(this.props.title);
        const renderers = {
            image: MyImage
        };

        return (
            <div className={ moduleClasses.markdownBody }>
                <ReactMarkdownWithHtml children={this.props.body} allowDangerousHtml renderers={ renderers } />
            </div>
        )
    }
}

export default BlogPost;