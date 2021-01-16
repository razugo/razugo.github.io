import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import moduleClasses from '../css/Blog.module.css';

import BlogPost from './BlogPost';
import BlogTile from './BlogTile';

const posts = [
    require('../../markdown/example1.md'),
    require('../../markdown/example2.md')
];

class blog extends React.Component {
    fm = require('front-matter');
    fetchPosts = [];
    
    constructor(props) {
        super(props);
        this.state = { posts: [] }
    }
    
    componentDidMount() {
        for( const [index, path] of posts.entries() ) {
            fetch(path.default)
                .then(response => response.text())
                .then(text => { 
                    this.setState({ posts: this.state.posts.concat(text)}); 
                })
        }
    }

    timeToRead(str) {
        return Math.floor(str.split(' ').length / 250) + 1;
    }
    
    render() {
        var postTiles = this.state.posts.map((post) => {
            var content = this.fm(post);
            var name = content.attributes.title.replace(/[^A-Z0-9]+/ig, "_");
            return <BlogTile 
                        link={ '/blog/' + name } 
                        title={ content.attributes.title } 
                        description={ content.attributes.description } 
                        image={ content.attributes.image }
                        date={ content.attributes.date } 
                        length={ this.timeToRead(content.body) } 
                    />
        });

        var postRoutes = this.state.posts.map((post) => {
            var content = this.fm(post);
            var name = content.attributes.title.replace(/[^A-Z0-9]+/ig, "_");
            return (
                <Route path={ '/blog/' + name }>
                    <BlogPost key={ content.attributes.title } title={ content.attributes.title } body={ content.body } />
                </Route>
            );
        });

        return (
            <div className={ moduleClasses.blogContainer }>
                <Switch>
                    <Route exact path='/blog'>
                        { postTiles }
                    </Route>
                    { postRoutes }
                </Switch>
            </div>
        )
    }
}

export default withRouter(blog);