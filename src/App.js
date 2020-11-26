import React, { useState } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './Components/Header/Header'
import Footer from './Components/Footer/Footer'
import Home from './Components/Content/Home/Home'
import About from './Components/Content/About';
import Resume from './Components/Content/Resume';
import Contact from './Components/Content/Contact';

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
        <Contact></Contact>
        <Footer></Footer>
        
      </div>
    </body>
  );
}

export default App;
