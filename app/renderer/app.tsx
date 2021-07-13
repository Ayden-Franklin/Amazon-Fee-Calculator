import React from 'react'
import ReactDOM from 'react-dom'
import store from '@src/store'
import { Provider } from 'react-redux'
import Router from '@src/renderer/router'
function App() {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
