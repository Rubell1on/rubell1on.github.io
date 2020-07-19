import React from 'react'
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Index from '../index/index.jsx';
import Dashboard from '../dashboard/dashboard.jsx';
import NotFound from '../not-found/not-found.jsx';

import './style.css';

function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Index}/>
                <Route path="/schedule" component={Dashboard}/>
                <Route path="/exams" component={Dashboard}/>
                <Route path="/404" component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));