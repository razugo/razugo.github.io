import React from 'react';

function resumetile(props) {
    
    var time = props.time;
    var position = props.position;
    var company = props.company;
    var description = props.description;

    return (
        <div class="col-md-6">
            <div className="bg-white border rounded p-4 mb-4">
                <p className="badge badge-primary text-2 font-weight-400">{ time }</p>
                <h3 className="text-5">{ position }</h3>
                <p className="text-danger">{ company }</p>
                <p className="mb-0">{ description }</p>
            </div>
        </div>
    )
}

export default resumetile;