import React from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components/macro'
import Header from "./components/Header";
import Polling from './components/Header/Polling'
import Web3ReactManager from './components/Web3ReactManager';
import LimitOrder from './pages/LimitOrder';
import StopLimitOrder from './pages/StopLimitOrder';
import RangeOrder from './pages/RangeOrder';
import './App.css';

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const BodyWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 120px;
  width: 100%;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 120px 16px 16px 16px;
  `};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: 2;
`

function App() {
  return (
    <AppWrapper>
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
      <BodyWrapper>
        <Polling />
        <Web3ReactManager>
          <Switch>
            <Route exact strict path="/limit-order" component={LimitOrder} />
            <Route exact strict path="/stop-limit-order" component={StopLimitOrder} />
            <Route exact strict path="/range-order" component={RangeOrder} />
            <Route component={LimitOrder} />
          </Switch>
        </Web3ReactManager>
      </BodyWrapper>
    </AppWrapper>
  );
}

export default App;
