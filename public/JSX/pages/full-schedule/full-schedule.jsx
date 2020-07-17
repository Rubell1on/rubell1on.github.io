import React, {useEffect, useState} from 'react';

import {buildQuery} from '../../../../JS/react/utils.js';
import Week from '../../../../JS/react/week.js';
import './full-schedule.css';

export default function FullSchedule(props) {
    const [data, setData] = useState([]);

    useEffect(() => {
        setTitle();
        (async () => {
            const query = buildQuery({group: props.match.params.group});
            const res = await fetch(`/api/schedule?${query}`)
                .catch(e => console.error(e));
            
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                const weeks = processSchedule(data)
                setData(weeks);
            }
        })();
    }, []);

    function setTitle() {
        const params = props.match.params;
        document.title = params && params.group ? `${params.group} - Расписание` : 'Расписание';
    }

    function processSchedule(data) {
        const weeks = Object.entries(data.schedule).map(([weekNum, weekData]) => {
            console.log(weekNum);
            const sortedData = sortWeek(weekData);
            const days = sortedData.map((day, i) => {   
                const classes = Object.entries(day.dayData).map(([classId, classData]) => {
                    return <div className={`class class_style_${weekNum == 1 ? "even" : "odd"}`} key={classId}>
                        <div className="class__row">
                            <div className="class__id">{classId}</div>
                            <div className="class__name">{classData.name}</div>
                            <div className="class__room">{classData.room}</div>
                        </div>
                        <div className="class__row">
                            <div className="class__time">{`${classData.begin}-${classData.end}`}</div>
                            <div className="class__type">{classData.type}</div>
                            <div className="class__teacher">{classData.teacher}</div>
                        </div>
                    </div> 
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

        function sortWeek(data) {
            const weekDays =  ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
            return weekDays.map(day => { return {dayName: day, dayData: data[day]} });
        }
    }

    return (<>{data}</>)
}