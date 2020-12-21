import React from 'react';

import moduleClasses from '../css/Portfolio.module.css';

import PortfolioTile from './PortfolioTile';
import ResumeTile from './ResumeTile';

function portfolio() {
    return (
        <section id="portfolio" class="section">
            <div class="container px-lg-5">


                <div class="position-relative d-flex text-center mb-5">
                    <h2 class="text-24 text-light opacity-4 text-uppercase font-weight-600 w-100 mb-0">Portfolio</h2>
                    <p class="text-9 text-dark font-weight-600 position-absolute w-100 align-self-center line-height-4 mb-0">
                    My Work<span class="heading-separator-line border-bottom border-3 border-primary position-abolute d-block mx-auto"></span>
                    </p>
                </div>

                <div class="row">
                    <div class="col-sm-6 col-md-4">
                        <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" >Hello</PortfolioTile>
                        <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" ></PortfolioTile>
                        <PortfolioTile src="https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg" ></PortfolioTile>
                    </div>
                    <div class="col-sm-6 col-md-4">
                        <PortfolioTile src="https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg" ></PortfolioTile>
                        <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" ></PortfolioTile>
                    </div>
                    <div class="col-sm-6 col-md-4">
                        <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" ></PortfolioTile>
                        <PortfolioTile src="https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg" ></PortfolioTile>
                        <ResumeTile 
                            time='Spring 2019'
                            position='Robotics Software Engineering Intern'
                            company='Beyond Limits AI'
                            description='Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.'
                        ></ResumeTile>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default portfolio;