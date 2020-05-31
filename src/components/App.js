import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Login from './Login';
import Home from './Home';
import Loading from './Loading';
import Results from './Results';
import Transcription from './Transcription';
import ConfirmTrip from './ConfirmTrip';
import TrackTrip from './TrackTrip';
import Evaluation from './Evaluation'

import "bootstrap/dist/css/bootstrap.css";


class App extends Component {
  render() {
    return (
      <div className="background">
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/home" component={Home} />
          <Route path="/loading" component={Loading} />
          <Route path="/results" component={Results} />
          <Route path="/transcription" component={Transcription} />
          <Route path="/confirmTrip" component={ConfirmTrip} />
          <Route path="/trackTrip" component={TrackTrip} />
          <Route path="/evaluation" component={Evaluation} />
        </Switch>
      </div>                     
    )
  }
}

export default App;