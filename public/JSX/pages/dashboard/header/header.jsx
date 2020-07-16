import React from 'react';
import './header.css';

export default function Header() {
    return (
        <div className="header">
            <div className="header__controls">
                <div className="header__element header__menu">Меню</div>
                <div className="header__element header__week">Неделя</div>
            </div>
            <div className="header__controls">
                <div className="header__element header__menu">Донат</div>
                <div className="header__element header__menu">Обратная связь</div>
                <div className="header__element header__week">Выход</div>
            </div>
        </div>
    )
}