import React, {useState, useEffect} from 'react';
import {getCurrStudyWeek} from '../../../../../JS/react/utils.js';
import './header.css';
import coinGif from '../../../../IMG/spinnig_coin.gif';

export default function Header() {
    const [week, setWeek] = useState(0);

    useEffect(() => {
        const weeksDiff = getCurrStudyWeek();
        const currWeekNum = weeksDiff <= 0 ? 0 : weeksDiff;
        setWeek(currWeekNum);
    }, []);

    return (
        <div className="header">
            <div className="header__controls">
                <div className="header__element header__menu">Меню</div>
                <div className="header__element header__week">#{week}</div>
            </div>
            <div className="header__controls">
                <div className="header__element header__donation donation">
                    <img className="donation__icon" src={coinGif} />
                </div>
                <div className="header__element header__feebback">Обратная связь</div>
                <div className="header__element header__quit">Выход</div>
            </div>
        </div>
    )
}