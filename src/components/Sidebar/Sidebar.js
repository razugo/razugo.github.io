import React from 'react';
import classes from './Sidebar.module.css';

import { Link } from "react-router-dom";

import Header from './Header/Header';
import Footer from './Footer/Footer';

const sidebar = (props) => {

    const sidebarClasses = [classes.sidebar];
    if(props.open) sidebarClasses.push(classes.active);

    return (
        <div className={ sidebarClasses.join(' ') } id="mySidebar">
            <Header></Header>
            
            <Link to="/about">About</Link>
            <Link to="/">Blog</Link>
            <Link to="/">Resume</Link>
            <Link to="/">Random Shit</Link>
            
            <Footer></Footer>
        </div>
    );
}

export default sidebar;