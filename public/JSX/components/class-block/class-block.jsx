import React from 'react';

import './class-block.css';

export default function ClassBlock({id, name, room, classBegin, classEnd, type, teacherName, weekParity = 1}) {
    return (
        <div className={`class class_style_${weekParity == 1 ? "even" : "odd"}`}>
            <div className="class__row">
                <div className="class__id">{id}</div>
                <div className="class__name">{name}</div>
                <div className="class__room">{room}</div>
            </div>
            <div className="class__row">
                <div className="class__time">{`${classBegin}-${classEnd}`}</div>
                <div className="class__type">{type}</div>
                <div className="class__teacher">{teacherName}</div>
            </div>
        </div> 
    )
}