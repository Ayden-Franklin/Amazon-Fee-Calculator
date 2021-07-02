import React from 'react';
import { HashRouter, Switch, Route, useRouteMatch } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import styles from '@src/renderer/container/root/index.less';
import DefaultPage from '@src/renderer/container/default';
import Header from '@src/renderer/container/header';
import Footer from '@src/renderer/container/footer';
import Calculator from '@src/renderer/components/calculator';
import FBATable from '@src/renderer/components/fba';
import TiersTable from '@src/renderer/components/tiers';
import ReferralTable from '@src/renderer/components/ref';
import ClosingFee from '@src/renderer/components/closing';
import WeightRule from '@src/renderer/components/weight';
const sections = [
  { title: 'Tiers', url: '/main/tiers' },
  { title: 'Dimensional weight', url: '/main/weight' },
  { title: 'FBA Fee', url: '/main/fba' },
  { title: 'Referral Fee', url: '/main/referral' },
  { title: 'Closing Fee', url: '/main/closing' },
  { title: 'Calculator', url: '/main/calculator' },
];
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0),
  },
}));
function Root() {
  let { path, url } = useRouteMatch();
  const classes = useStyles();
  return (
    <>
      <CssBaseline />
      <Container className={classes.root} maxWidth={false}>
        <Header title="Demo" sections={sections} />
        <main style={{ height: '470px', width: '100%', overflow: 'auto', background: '#EEEEEE' }}>
          <HashRouter>
            <Switch>
              <Route exact path={path}>
                <DefaultPage />
              </Route>
              <Route path={`${path}/tiers`}>
                <TiersTable />
              </Route>
              <Route path={`${path}/weight`}>
                <WeightRule />
              </Route>
              <Route path={`${path}/fba`}>
                <FBATable />
              </Route>
              <Route path={`${path}/referral`}>
                <ReferralTable />
              </Route>
              <Route path={`${path}/closing`}>
                <ClosingFee />
              </Route>
              <Route path={`${path}/calculator`}>
                <Calculator />
              </Route>
            </Switch>
          </HashRouter>
        </main>
        <Footer title="Ayden Franklin" description="We can use this tool to investigate Amazon" />
      </Container>
    </>
  );
}
export default Root;
