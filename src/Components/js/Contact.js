import React from 'react';

const contact = (props) => {
    return (
        <section id="contact" class="section bg-light">
            <div class="container px-lg-5">

                <div class="position-relative d-flex text-center mb-5">
                    <h2 class="text-24 text-light opacity-4 text-uppercase font-weight-600 w-100 mb-0">Contact</h2>
                    <p class="text-9 text-dark font-weight-600 position-absolute w-100 align-self-center line-height-4 mb-0">Get in Touch<span class="heading-separator-line border-bottom border-3 border-primary position-abolute d-block mx-auto"></span> </p>
                </div>


                <div class="row justify-content-md-center">
                    <div class="col-md-8  col-xl-9 order-0 order-md-1">
                        <h2 class="mb-3 text-5 text-uppercase text-center text-md-left">Send us a note</h2>
                        <form id="contact-form" action="mailto:rwakugawa@gmail.com" method="post" enctype="text/plain">
                            <div class="row">
                                <div class="col-xl-6">
                                    <div class="form-group">
                                        <input name="name" type="text" class="form-control" required="" placeholder="Name"/>
                                    </div>
                                </div>
                                <div class="col-xl-6">
                                    <div class="form-group">
                                        <input name="email" type="text" class="form-control" required="" placeholder="Email"/>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <textarea name="comment" class="form-control" rows="5" required="" placeholder="Tell us more about your needs........"></textarea>
                            </div>
                            <p class="text-center mt-4 mb-0">
                                <button id="submit-btn" class="btn btn-primary rounded-pill d-inline-flex" type="submit">Send Message</button>
                            </p>
                        </form>
                    </div>
                </div> 



            </div>
        </section>
    );
}

export default contact;