import React from 'react';

import moduleClasses from '../css/ResumeTile.module.css';

function resumetile(props) {
    
    var time = props.time;
    var position = props.position;
    var company = props.company;
    var description = props.description;

    return (
        <div class="col-md-6">
            <div className="bg-white border rounded p-4 mb-4">
                <p className={ moduleClasses.resumeTime }>{ time }</p>
                <h3 className="text-5">{ position }</h3>
                <p className={ moduleClasses.resumeCompany }>{ company }</p>
                <p className="mb-0">{ description }</p>
            </div>
        </div>
    )
}

export default resumetile;