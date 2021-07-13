import React, { useState, useEffect } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import BusinessIcon from '@material-ui/icons/Business'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { useSelector } from 'react-redux'
import { selectTierRule } from '@src/store/tiersSlice'
import { fetchRuleContent as fetchTierContent } from '@src/store/tiersSlice'
import { fetchRuleContent as fetchDimensionalWeighContent } from '@src/store/dimensionalWeightSlice'
import { fetchRuleContent as fetchFbaContent } from '@src/store/fbaSlice'
import { fetchRuleContent as fetchReferralContent } from '@src/store/referralSlice'
import { fetchRuleContent as fetchClosingContent } from '@src/store/closingSlice'
import { selectCalculator, changeLoadStatus, changeProductInput, calculate } from '@src/store/calculatorSlice'
import { checkPrerequisite, checkProductInputReady } from '@src/service/calculator'
import { useAppDispatch } from '@src/store/hooks'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  root: {
    width: 'fit-content',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    '& svg': {
      margin: theme.spacing(1.5),
    },
    '& hr': {
      margin: theme.spacing(0, 0.5),
    },
  },
}))
function Calculator() {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [initialized, setInitialized] = useState(false)
  const calculatorStore = useSelector(selectCalculator)
  const initProductInput = (v: number | undefined) => (v ? v : 0)
  const [length, setLength] = useState(initProductInput(calculatorStore.productInput?.length))
  const [width, setWidth] = useState(initProductInput(calculatorStore.productInput?.width))
  const [height, setHeight] = useState(initProductInput(calculatorStore.productInput?.height))
  const [weight, setWeight] = useState(initProductInput(calculatorStore.productInput?.weight))
  const [price, setPrice] = useState(initProductInput(calculatorStore.productInput?.price))
  const [cost, setCost] = useState(initProductInput(calculatorStore.productInput?.cost))
  const [net, setNet] = useState(initProductInput(calculatorStore.productInput?.net))

  const tierRule = useSelector(selectTierRule)

  const handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLength(parseFloat(event.target.value))
  }
  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(parseFloat(event.target.value))
  }
  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(parseFloat(event.target.value))
  }
  const handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(parseFloat(event.target.value))
  }
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(parseFloat(event.target.value))
  }
  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCost(parseFloat(event.target.value))
  }

  const tryToCalculate = () => {
    dispatch(changeProductInput({ productInput: { length, width, height, weight, price, cost } }))
    if (checkProductInputReady()) {
      dispatch(calculate())
    }
  }
  const handleLoadClick = () => {
    dispatch(changeLoadStatus({ status: true }))
    Promise.all([
      dispatch(fetchTierContent()),
      dispatch(fetchDimensionalWeighContent()),
      dispatch(fetchFbaContent()),
      dispatch(fetchReferralContent()),
      dispatch(fetchClosingContent()),
    ]).then((values) => {
      dispatch(changeLoadStatus({ status: false }))
      setInitialized(true)
    })
  }
  useEffect(() => {
    const v = checkPrerequisite()
    setInitialized(v)
  }, [initialized])
  useEffect(() => {
    // console.log('effect!!! length = ', length, ' width = ', width, ' height = ', height)
    const fbaFee = 3.5
    const referralFee = 2.6
    const closingFee = 0
    tryToCalculate()
  }, [length, width, height, weight, cost, price])

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid item xs={12}>
          <Grid container justify="center" alignItems="center" spacing={2}>
            <Grid item>
              <Avatar className={classes.avatar}>
                <BusinessIcon />
              </Avatar>
            </Grid>
            <Grid item>
              <Typography component="h1" variant="h5">
                Real-time cost Revenue Calculator
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {initialized ? (
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid container item spacing={4} xs={5} className={classes.root}>
                <Grid item xs={4}>
                  <TextField
                    name="length"
                    variant="outlined"
                    required
                    fullWidth
                    id="length"
                    value={length > 0 ? length : ''}
                    label="Length"
                    autoFocus
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">inches</InputAdornment>,
                    }}
                    onChange={handleLengthChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="width"
                    value={width > 0 ? width : ''}
                    label="Width"
                    name="width"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">inches</InputAdornment>,
                    }}
                    onChange={handleWidthChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="height"
                    value={height > 0 ? height : ''}
                    label="Height"
                    name="height"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">inches</InputAdornment>,
                    }}
                    onChange={handleHeightChange}
                  />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="weight"
                    value={weight > 0 ? weight : ''}
                    label="Unit weight"
                    name="weight"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">pounds</InputAdornment>,
                    }}
                    onChange={handleWeightChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel id="category">Product category:</InputLabel>
                  <Select id="select" labelId="category" value="21">
                    <MenuItem value="1">Amazon Device Accessories</MenuItem>
                    <MenuItem value="2">Automotive and Powersports</MenuItem>
                    <MenuItem value="3">Baby Products (excluding Baby Apparel)</MenuItem>
                    <MenuItem value="4">Beauty</MenuItem>
                    <MenuItem value="5">Books</MenuItem>
                    <MenuItem value="6">Clothing and Accessories</MenuItem>
                    <MenuItem value="7">Collectible Coins</MenuItem>
                    <MenuItem value="8">Consumer Electronics</MenuItem>
                    <MenuItem value="9">DVD</MenuItem>
                    <MenuItem value="10">Electronics Accessories</MenuItem>
                    <MenuItem value="11">Entertainment Collectibles</MenuItem>
                    <MenuItem value="12">Fine Art</MenuItem>
                    <MenuItem value="13">Furniture (including outdoor furniture) - Mattresses</MenuItem>
                    <MenuItem value="14">Furniture (including outdoor furniture) - Others</MenuItem>
                    <MenuItem value="15">Gift Cards</MenuItem>
                    <MenuItem value="16">Gourmet and Grocery Food</MenuItem>
                    <MenuItem value="17">Health & Personal Care (including Personal Care Appliances)</MenuItem>
                    <MenuItem value="18">Home and Garden (including Pet Supplies)</MenuItem>
                    <MenuItem value="19">
                      Industrial & Scientific (including Food Service and Janitorial & Sanitation)
                    </MenuItem>
                    <MenuItem value="20">Jewelry</MenuItem>
                    <MenuItem value="21">Kitchen</MenuItem>
                    <MenuItem value="22">Major Appliances</MenuItem>
                    <MenuItem value="23">Music</MenuItem>
                    <MenuItem value="24">Musical Instruments</MenuItem>
                    <MenuItem value="25">Office Products</MenuItem>
                    <MenuItem value="26">Outdoors</MenuItem>
                    <MenuItem value="27">Personal Computers</MenuItem>
                    <MenuItem value="28">Shoes</MenuItem>
                    <MenuItem value="29">Software and Computer/Video Games</MenuItem>
                    <MenuItem value="30">Sports (excluding Sports Collectibles)</MenuItem>
                    <MenuItem value="31">Sports Collectibles</MenuItem>
                    <MenuItem value="32">Tools and Home Improvement</MenuItem>
                    <MenuItem value="33">Tools and Home Improvement - Base Equipment Power Tools</MenuItem>
                    <MenuItem value="34">Toys & Games - Collectible Cards</MenuItem>
                    <MenuItem value="35">Toys and Games</MenuItem>
                    <MenuItem value="36">Video Game Consoles</MenuItem>
                    <MenuItem value="37">Watches</MenuItem>
                    <MenuItem value="38">Everything Else</MenuItem>
                  </Select>
                </Grid>
                <Button type="submit" variant="contained" color="primary" className={classes.submit}>
                  Estimate
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Divider orientation="vertical" flexItem />
              </Grid>
              <Grid container item spacing={2} xs={6} className={classes.root}>
                <Grid item xs={3}>
                  <Typography>Dimenstions</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="dimenstions-value"
                    value={`${length} * ${width} * ${height}`}
                    disabled
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Typography>Price</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="outlined-read-only-input"
                    defaultValue="0"
                    type="number"
                    variant="outlined"
                    error
                    required
                    size="small"
                    onChange={handlePriceChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>Tier</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="tier-value"
                    value={calculatorStore.tierIndex > -1 ? tierRule?.tierNames[calculatorStore.tierIndex] : 'Unknown'}
                    disabled
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Typography>Cost</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="outlined-read-only-input"
                    defaultValue="0"
                    type="number"
                    variant="outlined"
                    size="small"
                    onChange={handleCostChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>FBA Fee</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="tier-value"
                    disabled
                    value={`$${calculatorStore.fbaFee}`}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Typography>Total Fees</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="total-fee-value"
                    disabled
                    value={`$${calculatorStore.totalFee}`}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>Referral Fee</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="referral-value"
                    disabled
                    value={`$${calculatorStore.referralFee}`}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Typography>Net</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="net-value"
                    value={`$${calculatorStore.net}`}
                    disabled
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>Closing Fee</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="closing-value"
                    disabled
                    value={`$${calculatorStore.closingFee}`}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Container maxWidth="lg">
            <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
              The rules for calculation are not initialized. Do you want to load immediately?
            </Typography>
            <Typography variant="h6" align="center" gutterBottom>
              <Button
                type="button"
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={calculatorStore.loadStatus}
                onClick={handleLoadClick}
              >
                {calculatorStore.loadStatus ? 'Loading' : 'Load'}
              </Button>
            </Typography>
          </Container>
        )}
      </div>
    </Container>
  )
}
export default Calculator
