import React, {useEffect, useState} from 'react';
import {useParams, useLocation} from 'react-router-dom';

import ClassBlock from '../../components/class-block/class-block.jsx';

import {buildQuery} from '../../../../JS/react/utils.js';

export default function Exams(props) {
    const [data, setData] = useState([]);
    const params = useParams();

    useEffect(() => {
        setTitle('Экзамены');
        (async () => {
            const query = buildQuery({group: params.group});
            const res = await fetch(`/api/exams?${query}`)
                .catch(e => console.error(e));
            
            if (res.ok) {
                const data = await res.json();
                const weeks = processSchedule(data)
                setData(weeks);
            }
        })();
    }, []);

    function setTitle(title) {
        document.title = params && params.group ? `${params.group} - ${title}` : title;
    }

    function processSchedule(data) {
        if (data.exams) {
            const weeks = Object.entries(data.exams).map(([month, monthData], i) => {
                const classes = Object.entries(monthData).map(([day, dayData], i) => {   
                    return <ClassBlock 
                                key={i}
                                id={day} 
                                name={dayData.name} 
                                room={dayData.room}
                                classBegin={dayData.startTime} 
                                type={dayData.type}
                                teacherName={dayData.teacher}
                            />
                });

                return classes.length 
                    ? <div className="day" key={i}>
                        <div className="day__name">{month}</div>
                        <div className="day__classes">{classes}</div>
                    </div>
                    : null; 
            });
    
            return <div className="schedule schedule_odd">{weeks}</div>
        } else {
            return null;
        }
    }

    return (<>{data ? data : <h2 style={{width: "100%", textAlign: "center"}}>На сегодня занятий нет!</h2>}</>)
}