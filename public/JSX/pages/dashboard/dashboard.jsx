import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';

import Header from './header/header.jsx';
import Schedule from '../schedule/schedule.jsx';
import Exams from '../exams/exams.jsx';

export default function Dashboard(props) {
    return (
        <>
            <Header />
            <Switch>
                <Route exact path="/schedule">
                    <Redirect exact to="/404" />
                </Route>
                <Route exact path="/schedule/:group" component={Schedule} />
                <Route exact path="/exams/:group" component={Exams} />
            </Switch>
        </>
    )
}