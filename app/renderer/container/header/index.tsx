import React, { useState, useEffect } from 'react'
import { shell } from 'electron'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import InfoIcon from '@material-ui/icons/Info'
import Paper from '@material-ui/core/Paper'
import HomeIcon from '@material-ui/icons/Home'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import { useHistory } from 'react-router-dom'
import { changeCountry } from '@src/store/countrySlice'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { countryMenuItems } from '@src/renderer/constants'
import { setCountry } from '@src/store/rulesSlice'
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    margin: {
      margin: theme.spacing(1),
    },
  })
)
export default function Header(props: HeaderProps) {
  const history = useHistory()
  const classes = useStyles()
  const { sections, title } = props
  const country = useAppSelector((state) => state.country)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [tabIndex, setTabIndex] = useState(7)
  const dispatch = useAppDispatch()
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault()
    const country = countryMenuItems[index]
    dispatch(changeCountry(country))
    dispatch(setCountry(country))
    handleClose()
  }
  const handleAbout = () => {
    history.push('/about')
  }
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue)
    history.push(sections[newValue].url)
  }
  useEffect(() => {
    const country = countryMenuItems[0]
    dispatch(setCountry(country))
  }, [dispatch])
  return (
    <React.Fragment key="header-fragment">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          <Button
            aria-controls="country-menu"
            aria-haspopup="true"
            variant="contained"
            color="primary"
            onClick={handleClick}
          >
            {country.name}
          </Button>
          <Menu id="country-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
            {countryMenuItems.map((menuItem, index) => (
              <MenuItem
                key={menuItem.code}
                disabled={menuItem.code === country.code}
                selected={menuItem.code === country.code}
                onClick={(event) => handleMenuItemClick(event, index)}
              >
                {menuItem.name}
              </MenuItem>
            ))}
          </Menu>
          {/* <Button
            variant="outlined"
            size="small"
            onClick={() => {
              shell.openExternal('https://www.amazon.com')
              // alert('sss')
            }}
          >
            Open Amazon
          </Button> */}
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            color="inherit"
            onClick={handleAbout}
          >
            <InfoIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Paper square>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          {sections.map((section) => (
            <Tab key={section.title} label={section.title} />
          ))}
        </Tabs>
      </Paper>
    </React.Fragment>
  )
}
export interface HeaderProps {
  sections: {
    title: string
    url: string
  }[]
  title: string
}
