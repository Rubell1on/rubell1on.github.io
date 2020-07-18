import React, {useEffect, useState} from 'react';
import {useParams, useLocation} from 'react-router-dom';

import ClassBlock from '../../components/class-block/class-block.jsx';

import {buildQuery, parseQuery} from '../../../../JS/react/utils.js';
import Week from '../../../../JS/react/week.js';

import './schedule.css';

export default function Schedule(props) {
    const [data, setData] = useState([]);
    const location = useLocation();
    const {current} = location.search ? parseQuery(location.search) : "";
    const params = useParams();

    useEffect(() => {
        setTitle();
        (async () => {
            const query = buildQuery({group: params.group, current});
            const res = await fetch(`/api/schedule?${query}`)
                .catch(e => console.error(e));
            
            if (res.ok) {
                const data = await res.json();
                const weeks = processSchedule(data)
                setData(weeks);
            }
        })();
    }, [location]);

    function setTitle() {
        document.title = params && params.group ? `${params.group} - Расписание` : 'Расписание';
    }

    function processSchedule(data) {
        if (data.schedule) {
            const weeks = Object.entries(data.schedule).map(([weekNum, weekData]) => {
                const sortedData = sortWeek(weekData);
                const days = sortedData.map((day, i) => {   
                    const classes = Object.entries(day.dayData).map(([classId, classData]) => {
                        return <ClassBlock 
                                    key={classId}
                                    id={classId} 
                                    name={classData.name} 
                                    room={classData.room}
                                    classBegin={classData.begin} 
                                    classEnd={classData.end} 
                                    type={classData.type}
                                    teacherName={classData.teacher}
                                    weekParity={weekNum}
                                />
                    });
    
                    return classes.length 
                    ? <div className="day" key={i}>
                        <div className="day__name">{day.dayName}</div>
                        <div className="day__classes">{classes}</div>
                    </div>
                    : null;
                }).filter(e => e);
    
    
    
                return <div key={weekNum} className={`schedule__week${weekNum == Week.weekParity.odd ? " odd" : " even"}`}>
                    <div className="schedule__label">{weekNum == 1 ? "Нечетная" : "Четная"} неделя</div>
                    <div className="schedule__days">{days}</div>
                </div>
            })
    
            return <div className={`schedule${Week.parity === Week.weekParity.odd ? " schedule_odd" : " schedule_even"}`}>{weeks}</div>
        } else {
            return null;
        }
        

        function sortWeek(data) {
            const weekDays =  ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
            return weekDays.map(day => { 
                const classes = data[day];
                return classes && Object.entries(classes) ? {dayName: day, dayData: classes} : null;
            }).filter(e => e);
        }
    }

    return (<>{data ? data : <h2 style={{width: "100%", textAlign: "center"}}>На сегодня занятий нет!</h2>}</>)
}