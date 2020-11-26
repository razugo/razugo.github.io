import React from 'react';

const resume = (props) => {
    return (
        <section id="resume" class="section">
            <div class="container px-lg-5">


                <div class="position-relative d-flex text-center mb-5">
                    <h2 class="text-24 text-light opacity-4 text-uppercase font-weight-600 w-100 mb-0">Summary</h2>
                    <p class="text-9 text-dark font-weight-600 position-absolute w-100 align-self-center line-height-4 mb-0">
                    Resume<span class="heading-separator-line border-bottom border-3 border-primary position-abolute d-block mx-auto"></span>
                    </p>
                </div>



                <h2 class="text-6 font-weight-600 mb-4">My Education</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="bg-white border rounded p-4 mb-4">
                            <p class="badge badge-primary text-2 font-weight-400">Spring 2019 - Fall 2017</p>
                            <h3 class="text-5">Computer Engineering and Computer Science</h3>
                            <p class="text-danger">University of Southern California</p>
                            <p class="mb-0">Magna Cum Laude, Makers</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="bg-white border rounded p-4 mb-4">
                        <p class="badge badge-primary text-2 font-weight-400">Spring 2017 - Fall 2015</p>
                            <h3 class="text-5">Computer Engineering</h3>
                            <p class="text-danger">California Polytechnic State University San Luis Obispo</p>
                            <p class="mb-0">Roborodentia, Tau Beta Pi, University Housing</p>
                        </div>
                    </div>
                </div>



                <h2 class="text-6 font-weight-600 mb-4">My Experience</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="bg-white border rounded p-4 mb-4">
                            <p class="badge badge-primary text-2 font-weight-400">Present - Fall 2019</p>
                            <h3 class="text-5">Software Developer</h3>
                            <p class="text-danger">Hulu</p>
                            <p class="mb-0">Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim
                            iriure.</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="bg-white border rounded p-4 mb-4">
                            <p class="badge badge-primary text-2 font-weight-400">Spring 2019</p>
                            <h3 class="text-5">Robotics Software Engineering Intern</h3>
                            <p class="text-danger">Beyond Limits AI</p>
                            <p class="mb-0">Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim
                            iriure.</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="bg-white border rounded p-4 mb-4">
                            <p class="badge badge-primary text-2 font-weight-400">Summer 2018</p>
                            <h3 class="text-5">Software Development Intern</h3>
                            <p class="text-danger">Hulu</p>
                            <p class="mb-0">Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim
                            iriure.</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="bg-white border rounded p-4 mb-4">
                            <p class="badge badge-primary text-2 font-weight-400">Summer 2017</p>
                            <h3 class="text-5">Software Engineering Intern</h3>
                            <p class="text-danger">Veritas Technologies</p>
                            <p class="mb-0">Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim
                            iriure.</p>
                        </div>
                    </div>
                </div>



                <div class="text-center mt-5"><a href="https://drive.google.com/file/d/1hkc1P1MRbtcwCHQTRDmvvEFn-mUzYJLR/view?usp=sharing"
                    class="btn btn-outline-secondary rounded-pill shadow-none">Download CV <span class="ml-1"><i
                        class="fas fa-download"></i></span></a>
                </div>



            </div>
      </section>
    );
}

export default resume;