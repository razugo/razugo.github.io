import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from "react-router-dom";

import './index.css';
import './assets/font-awesome/css/font-awesome.css';
import './assets/font-awesome/css/font-awesome.min.css';

import Sidebar from './components/Sidebar/Sidebar';
import ToggleButton from './components/ToggleButton/ToggleButton';
import Content from './components/Content/Content';


function App() {

  const [open, setOpen] = useState(false);

  function buttonClick() {
    setOpen(!open);
  }

  return (
    <Router>
      <Sidebar open={ open }/>
      <ToggleButton onClick={ buttonClick } open={ open }></ToggleButton>
      <Content open={ open }/>
    </Router>
  );
}

export default App;
