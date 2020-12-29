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

            <h2 class="text-6 font-weight-600 mb-4">My Experience</h2>
            <div class="row">
                <ResumeTile 
                    time='Present - Fall 2019'
                    position='Software Developer'
                    company='Hulu'
                    description='Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.'
                />
                <ResumeTile 
                    time='Spring 2019'
                    position='Robotics Software Engineering Intern'
                    company='Beyond Limits AI'
                    description='Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.'
                />
                <ResumeTile 
                    time='Summer 2018'
                    position='Software Development Intern'
                    company='Hulu'
                    description='Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.'
                />
                <ResumeTile 
                    time='Summer 2017'
                    position='Software Engineering Intern'
                    company='Veritas Technologies'
                    description='Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.'
                />
            </div>

            <div class="text-center mt-5">
                <a href="https://drive.google.com/file/d/1hkc1P1MRbtcwCHQTRDmvvEFn-mUzYJLR/view?usp=sharing"
                    class="btn btn-outline-secondary rounded-pill shadow-none">Download CV <span class="ml-1"><i
                    class="fas fa-download"></i></span></a>
            </div>
      </section>
    );
}

export default resume;