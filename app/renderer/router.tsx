import React from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import Root from '@src/renderer/container/root'
import About from '@src/renderer/container/about'

function Router() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/main">
          <Root />
        </Route>
        <Route path="/about">
          <About />
        </Route>
      </Switch>
      <Redirect to="/main" />
    </HashRouter>
  )
}
export default Router
