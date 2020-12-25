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
                    <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" />
                    <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" />
                    <PortfolioTile src="https://static.toiimg.com/photo/72975551.cms" />
                    <PortfolioTile src="https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg" />
                    <PortfolioTile src="https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg" />
                    <PortfolioTile src="https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg" />
                </div>

            </div>
        </section>
    );
}

export default portfolio;