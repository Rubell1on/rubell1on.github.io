import React, {useEffect, useState} from 'react';
import {Switch, Route, Link, Redirect} from 'react-router-dom';

import Header from './header/header.jsx';
import Schedule from '../schedule/schedule.jsx';

export default function Dashboard(props) {
    return (
        <>
            <Header />
            <Switch>
                <Route exact path="/schedule">
                    <Redirect exact to="/404" />
                </Route>
                <Route exact path="/schedule/:group" component={Schedule} />
            </Switch>
        </>
    )
}