import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Sidebar from   './Components/js/Sidebar'
import Footer from    './Components/js/Footer'
import Home from      './Components/js/Home'
import About from     './Components/js/About';
import Resume from    './Components/js/Resume';
import Portfolio from './Components/js/Portfolio';

import Gallery from   './Components/js/Gallery';
import Blog from       './Components/js/Blog';
import BlogPost from   './Components/js/BlogPost';
import BlogTile from   './Components/js/BlogTile';

function App() {

    const [open, setOpen] = useState(false)

    function buttonClick() {
        setOpen(!open);
    }

    return (
    
        <body class="side-header" data-spy="scroll" data-target=".navbar" data-offset="1">
            <div id="main-wrapper">

                <Sidebar onClick={ buttonClick } open={ open }/>
                
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Home/>
                            <About/>
                            <Resume/>
                            <Portfolio/>
                            <Footer/>
                        </Route>
                        <Route path="/gallery">
                            <Gallery/>
                        </Route>
                        <Route path="/blog">
                                <Blog/>
                        </Route>
                    </Switch>
                </Router>

            </div>
        </body>
    );
}

export default App;
