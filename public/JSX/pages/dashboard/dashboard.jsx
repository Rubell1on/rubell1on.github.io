import React, {useEffect, useState} from 'react';
import {Switch, Route, Link} from 'react-router-dom';

import Header from './header/header.jsx';
import NotFound from '../not-found/not-found.jsx';
import FullSchedule from '../full-schedule/full-schedule.jsx';

export default function Dashboard(props) {
    return (
        <>
            <Header />
            <Switch>
                <Route exact path="/schedule" component={NotFound}/>
                <Route exact path="/schedule/:group" component={FullSchedule} />
            </Switch>
        </>
    )
}