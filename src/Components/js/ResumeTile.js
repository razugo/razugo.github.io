import React from 'react';

function resumetile(props) {
    
    var time = props.time;
    var position = props.position;
    var company = props.company;
    var description = props.description;

    return (
        <div class="bg-white border rounded p-4 mb-4">
            <p class="badge badge-primary text-2 font-weight-400">{ time }</p>
            <h3 class="text-5">{ position }</h3>
            <p class="text-danger">{ company }</p>
            <p class="mb-0">{ description }</p>
        </div>
    )
}

export default resumetile;