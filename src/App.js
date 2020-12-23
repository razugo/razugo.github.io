import React, { useState } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from    './Components/js/Header'
import Footer from    './Components/js/Footer'
import Home from      './Components/js/Home'
import About from     './Components/js/About';
import Resume from    './Components/js/Resume';
import Portfolio from './Components/js/Portfolio';

function App() {

  const [open, setOpen] = useState(false)

  function buttonClick() {
    setOpen(!open);
  }

  return (
    <body class="side-header" data-spy="scroll" data-target=".navbar" data-offset="1">
      <div id="main-wrapper">
        <Header onClick={ buttonClick } open={ open }></Header>
        <Home></Home>
        <About></About>
        <Resume></Resume>
        <Portfolio></Portfolio>
        <Footer></Footer>
      </div>
    </body>
  );
}

export default App;
