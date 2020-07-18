import React, {useState, useEffect} from 'react';
import {Link, useRouteMatch, useHistory, useLocation} from 'react-router-dom';

import Week from '../../../../../JS/react/week.js';
import { buildQuery } from '../../../../../JS/react/utils.js';

import './header.css';

import coinGif from '../../../../IMG/spinnig_coin.gif';

export default function Header() {
    const history = useHistory();
    const match = useRouteMatch("/:type/:group");
    const [isMenuOpened, setMenu] = useState(false);
    const [week, setWeek] = useState(0);

    useEffect(() => {
        const weeksDiff = Week.currStudyWeek;
        const currWeekNum = weeksDiff <= 0 ? 0 : weeksDiff;
        setWeek(currWeekNum);
    }, []);

    function handleQuit() {
        localStorage.removeItem('group');
        history.push('/');
    }

    function handleMenuClick() {
        setMenu(isMenuOpened ? false : true);
    }

    return (
        <>
            {isMenuOpened 
                ? <div className="menu__wrapper">
                    <div className="menu__background" onClick={e => setMenu(false)}></div>
                    <div className="menu">
                        <div className="menu__header">Меню</div>
                        <div className="menu__link-list">
                            <Link className="menu__link" to={{pathname: `/schedule/${match.params.group}`, search: `?${buildQuery({current: true})}`}}>Текущее</Link>
                            <Link className="menu__link" to={`/schedule/${match.params.group}`}>Полное</Link>
                        </div>
                    </div>
                </div>
                : null
            }
            <div className="header">
                <div className="header__controls">
                    <div className="header__element header__menu" onClick={e => handleMenuClick()}>Меню</div>
                    <div className="header__element header__week">#{week}</div>
                </div>
                <div className="header__controls">
                    <div className="header__element header__donation donation">
                        <img className="donation__icon" src={coinGif} />
                    </div>
                    <div className="header__element header__feebback">Обратная связь</div>
                    <div className="header__element header__quit" onClick={e => handleQuit()}>Выход</div>
                </div>
            </div>
        </>
    )
}