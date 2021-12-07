import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from "./components/Header";
import Polling from './components/Header/Polling'
import Web3ReactManager from './components/Web3ReactManager';
import LimitOrder from './pages/LimitOrder';
import StopLimitOrder from './pages/StopLimitOrder';
import RangeOrder from './pages/RangeOrder';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <div>
        <Polling />
        <Web3ReactManager>
          <Switch>
            <Route exact strict path="/limit-order" component={LimitOrder} />
            <Route exact strict path="/stop-limit-order" component={StopLimitOrder} />
            <Route exact strict path="/range-order" component={RangeOrder} />
            <Route component={LimitOrder} />
          </Switch>
        </Web3ReactManager>
      </div>
    </div>
  );
}

export default App;
