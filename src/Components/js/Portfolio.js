import React from 'react';

import moduleClasses from '../css/Portfolio.module.css';

import PortfolioTile from './PortfolioTile';

import outdraftedImage from '../../assets/outdrafted.jpg';
import ledcubeImage from '../../assets/ledcube_closeup.jpg';
import speakersImage from '../../assets/speakers.jpg';
import raytracingGif from '../../assets/raytracing.gif';
import bigbuckbunnyGif from '../../assets/bigbuckbunny.gif';

function portfolio() {
    return (
        <section id="portfolio" class="section">
            <div class="container px-lg-5">

                <div class="position-relative d-flex text-center mb-5">
                    <h2 class="text-24 text-light opacity-4 text-uppercase font-weight-600 w-100 mb-0">Portfolio</h2>
                    <p class="text-9 text-dark font-weight-600 position-absolute w-100 align-self-center line-height-4 mb-0">
                        My Work
                        <span class="sectionUnderline"/>
                    </p>
                </div>

                <div class="row">
                    <PortfolioTile title="Outdrafted" technology="Machine Learning (Keras)" src={ outdraftedImage } />
                    <PortfolioTile title="Video Streaming" technology="Video Manifest Generation (Python)" src={ bigbuckbunnyGif } />
                    <PortfolioTile title="DIY Speakers" technology="Hardware (OP Amp)" src={ speakersImage } />
                    <PortfolioTile title="LED Cube" technology="Hardware (Multiplexing)" src={ ledcubeImage } />
                    <PortfolioTile title="Ray Tracing" technology="Distributed Computing (Cuda)" src={ raytracingGif } />
                </div>

            </div>
        </section>
    );
}

export default portfolio;