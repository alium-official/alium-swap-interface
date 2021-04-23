import React, { Suspense } from 'react'
import { BrowserRouter as Router, Redirect, Route, RouteProps, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { NotFound } from '@alium-official/uikit'

import backgroundImage from 'assets/svg/trade-background.svg'
import useEagerConnect from 'hooks/useEagerConnect'

import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import Menu from '../components/Menu'
import Web3ReactManager from '../components/Web3ReactManager'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  width: 100%;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 32px 20%;
  padding: 32px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  justify-content: center;

  background-image: url(${backgroundImage});
  background-repeat: no-repeat;
  background-position: top right;

  ${({ theme }) => theme.mediaQueries.lg} {
    background-image: url(${backgroundImage});
    background-repeat: no-repeat;
    background-position: top right;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 24px 18.6% 32px 18.6%;
  }

  @media screen and (max-width: 768px) {
    padding: 38px 24px;
  }
  @media screen and (max-width: 500px) {
    padding: 32px 11px;
  }
`

const DefaultRoute = ({ ...props }: RouteProps) => {
  const loginBlockVisible = true

  return (
    <Menu loginBlockVisible={loginBlockVisible}>
      <BodyWrapper>
        <Route {...props} />
      </BodyWrapper>
    </Menu>
  )
}

export default function App() {
  useEagerConnect()

  return (
    <Suspense fallback={null}>
      <Router>
        <AppWrapper>
          <Web3ReactManager>
            <Switch>
              <DefaultRoute exact path="/" component={() => <Redirect to="/swap" />} />
              <DefaultRoute exact strict path="/swap" component={Swap} />
              <DefaultRoute exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <DefaultRoute exact strict path="/send" component={RedirectPathToSwapOnly} />
              {/* <Route exact strict path="/migrate" component={Migrate} /> */}
              <DefaultRoute exact strict path="/find" component={PoolFinder} />
              <DefaultRoute exact strict path="/pool" component={Pool} />
              <DefaultRoute exact strict path="/create" component={RedirectToAddLiquidity} />
              <DefaultRoute exact path="/add" component={AddLiquidity} />
              <DefaultRoute exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <DefaultRoute exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <DefaultRoute exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <DefaultRoute exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route>
                <Menu loginBlockVisible={false}>
                  <NotFound redirectURL={process.env.REACT_APP_HOME_URL} />
                </Menu>
              </Route>
            </Switch>
          </Web3ReactManager>
        </AppWrapper>
      </Router>
    </Suspense>
  )
}
