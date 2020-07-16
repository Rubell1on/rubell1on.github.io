import React, {useState} from 'react';

import {buildQuery} from '../../../../JS/react/utils.js';

import './index.css';

export default function Index() {
    const [groupName, setGroupName] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const query = buildQuery({group: groupName});
        const res = await fetch(`/api/schedule?${query}`);

        if (res.ok) {
            const data = await res.json();
            if (data && data.groupName) {
                location.href=`/schedule/${data.groupName}`;
            }
        }
    }

    function handleChange(e) {
        setGroupName(e.target.value);
    }

    return (
        <div className="wrapper">
            <div className="wrapper__header">Расписание</div>
            <form className="group-selector" onSubmit={e => handleSubmit(e)}>
                <label className="group-selector__label" htmlFor="groupName">Название группы</label>
                <input className="group-selector__input" type="text" name="groupName" placeholder="Например, КУМО-01-18" onChange={e => handleChange(e)} required/>
                <button className="group-selector__submit" type="submit">Найти расписание</button>
            </form>
        </div>
    )
}