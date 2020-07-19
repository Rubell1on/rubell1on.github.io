import React, {useState, useEffect} from 'react';
import {NavLink, useRouteMatch, useHistory, useLocation} from 'react-router-dom';

import Week from '../../../../../JS/react/week.js';
import { buildQuery } from '../../../../../JS/react/utils.js';

import './header.css';

import coinGif from '../../../../IMG/spinnig_coin.gif';

export default function Header() {
    const history = useHistory();
    const match = useRouteMatch("/:type/:group");
    const [isMenuOpened, setMenu] = useState(false);
    const [menuButtons, setMenuButtons] = useState([]);
    const [week, setWeek] = useState(0);

    const menuElems = [
        {class: "menu__link", active: "menu__link_selected", to: `/schedule/${match.params.group}?${buildQuery({current: true})}`, text: "Текущее"},
        {class: "menu__link", active: "menu__link_selected", to: `/schedule/${match.params.group}`, text: "Полное"},
        {class: "menu__link", active: "menu__link_selected", to: `/exams/${match.params.group}`, text: "Экзамены"},
    ];

    useEffect(() => {
        const weeksDiff = Week.currStudyWeek;
        const currWeekNum = weeksDiff <= 0 ? 0 : weeksDiff;
        setWeek(currWeekNum);
        setMenuButtons(createMenuButtons(menuElems));
    }, []);

    function handleQuit() {
        localStorage.removeItem('group');
        history.push('/');
    }

    function handleMenuClick() {
        setMenu(isMenuOpened ? false : true);
    }

    function createMenuButtons(menuElems) {
        return menuElems.map((e, i) => <NavLink key={i} className={e.class} activeClassName={e.active} to={e.to} isActive={(m, l) => isActive(l, e)}>{e.text}</NavLink>);

        function isActive(location, menuElem) {
            return menuElem.to === `${location.pathname}${location.search}`;
        }
    }

    return (
        <>
            {isMenuOpened 
                ? <div className="menu__wrapper">
                    <div className="menu__background" onClick={e => setMenu(false)}></div>
                    <div className="menu">
                    <div className="menu__header">{match.params.group}</div>
                        <div className="menu__link-list">{menuButtons}</div>
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