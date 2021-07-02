import React from 'react';
import { shell } from 'electron';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
}));
export default function DefaultPage() {
  const classes = useStyles();
  return (
    <Container maxWidth="sm" component="main" className={classes.heroContent}>
      <Typography component="h1" variant="h3" color="inherit" gutterBottom>
        <p>This is the default page.</p> We can intrucude this tool.
      </Typography>
      <Typography variant="h5" color="inherit" paragraph>
        Get the leading all-in-one platform for finding, launching, and selling Amazon products
      </Typography>
      <Link
        variant="subtitle1"
        onClick={() => {
          shell.openExternal('https://www.junglescout.com');
        }}
      >
        Go to our website.
      </Link>
    </Container>
  );
}
