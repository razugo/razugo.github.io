import React from 'react';

import ResumeTile from './ResumeTile';

const resume = (props) => {
    return (
        <section id="resume" class="section container px-lg-5">
            <div class="position-relative d-flex text-center mb-5">
                <h2 class="text-24 text-light opacity-4 text-uppercase font-weight-600 w-100 mb-0">Summary</h2>
                <p class="text-9 text-dark font-weight-600 position-absolute w-100 align-self-center line-height-4 mb-0">
                    Resume<span class="sectionUnderline"/>
                </p>
            </div>

            <h2 class="text-6 font-weight-600 mb-4">My Experience</h2>
            <div class="row">
                <ResumeTile 
                    time='Present - Spring 2021'
                    position='Software Development Engineer II'
                    company='Amazon'
                    description='Building out a new Greenfield project focusing on ecomerce and AWS. Stay tuned!'
                />
                <ResumeTile 
                    time='Spring 2021 - Fall 2019'
                    position='Software Developer'
                    company='Hulu'
                    description='Building and maintaining scalable, fault tolerant systems for Hulu playback, focusing on DRM security and metadata aggregation for content, advertisements, and cdns'
                />
                <ResumeTile 
                    time='Spring 2019'
                    position='Robotics Software Engineering Intern'
                    company='Beyond Limits AI'
                    description='Helped kickstart autonomous robotics project for surveying and automated reporting'
                />
                <ResumeTile 
                    time='Summer 2018'
                    position='Software Development Intern'
                    company='Hulu'
                    description='Integrated new tracking logic to messaging pipeline for internal ad tracking and scheduling'
                />
                <ResumeTile 
                    time='Summer 2017'
                    position='Software Engineering Intern'
                    company='Veritas Technologies'
                    description="Implemented new feature for cross origin deduplication for Netbackup, Veritas's enterprise backup software"
                />
            </div>

            <h2 class="text-6 font-weight-600 mb-4">My Education</h2>
            <div class="row">
                    <ResumeTile 
                        time='Spring 2019 - Fall 2017'
                        position='Computer Engineering and Computer Science'
                        company='University of Southern California'
                        description='Magna Cum Laude, Makers'
                    />
                    <ResumeTile 
                        time='Spring 2017 - Fall 2015'
                        position='Computer Engineering'
                        company='California Polytechnic State University San Luis Obispo'
                        description='Roborodentia, Tau Beta Pi, University Housing'
                    />
            </div>
      </section>
    );
}

export default resume;