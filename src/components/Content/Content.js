import React from 'react';
import classes from './Content.module.css';

import About from '../About/About';
import Home from '../Home/Home';
import NewHome from '../NewHome/Home';
import { Route, Switch, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";

function content(props) {
    console.log(props);
    
    const contentClasses = [classes.content];
    if(props.open) contentClasses.push(classes.active);

    return (
        <div className={ contentClasses.join(' ') }>
            <TransitionGroup className={ classes.transition_group }>
                <CSSTransition
                    key={ props.location.key }
                    timeout={{ enter: 500, exit: 500 }}
                    classNames={'fade'}
                >
                    <div className={ classes.route_section }>
                        <Switch location={ props.location }>
                            <Route path="/about">
                                <About></About>
                            </Route>
                            <Route path="/">
                                <NewHome></NewHome>
                            </Route>
                        </Switch>
                    </div>
                </CSSTransition>
            </TransitionGroup>
            
        </div>
    );
}

export default withRouter(content);