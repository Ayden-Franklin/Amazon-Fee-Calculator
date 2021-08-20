import React, { useMemo } from 'react'
import { HashRouter, Switch, Route, useRouteMatch } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'
import { makeStyles } from '@material-ui/core/styles'
import DefaultPage from '@src/renderer/container/default'
import Header from '@src/renderer/container/header'
import Footer from '@src/renderer/container/footer'
import Calculator from '@src/renderer/components/calculator'
import RuleTypePage from '@src/renderer/components/rule-type-page'
const SECTIONS = [
  { title: 'Tiers', url: 'tier' },
  { title: 'Dimensional weight', url: 'dimensionalWeight' },
  { title: 'Packaging weight', url: 'packagingWeight' },
  { title: 'Shipping weight', url: 'shippingWeight' },
  { title: 'FBA Fee', url: 'fba' },
  { title: 'Referral Fee', url: 'referral' },
  { title: 'Closing Fee', url: 'closing' },
  { title: 'Calculator', url: 'calculator' },
]
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}))
function Root() {
  const { path } = useRouteMatch()
  const classes = useStyles()
  const merge = (type: string) => `${path}/${type}`
  const headerSections = useMemo(() => SECTIONS.map((i) => ({ ...i, url: merge(i.url) })), [path])
  return (
    <>
      <CssBaseline />
      <Container className={classes.root} maxWidth={false}>
        <Header title="Demo" sections={headerSections} />
        <main style={{ flex: 1, width: '100%', overflow: 'auto', background: '#EEEEEE' }}>
          <HashRouter>
            <Switch>
              <Route exact path={path}>
                <DefaultPage />
              </Route>
              {SECTIONS.map((item) => (
                <Route key={item.url} path={merge(item.url)}>
                  {item.url === 'calculator' ? <Calculator /> : <RuleTypePage type={item.url} />}
                </Route>
              ))}
            </Switch>
          </HashRouter>
        </main>
        <Footer title="Ayden Franklin" description="We can use this tool to investigate Amazon" />
      </Container>
    </>
  )
}
export default Root
