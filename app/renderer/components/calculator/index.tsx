import React, { useState, useEffect } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import BusinessIcon from '@material-ui/icons/Business'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { useSelector } from 'react-redux'
import { categoryItems, StateStatus } from '@src/service/constants'
import { fetchRuleContent } from '@src/store/rulesSlice'
import {
  selectCalculator,
  changeLoadStatus,
  changeProductInput,
  changeProductCategory,
  calculate,
  estimate,
} from '@src/store/calculatorSlice'
import { checkProductInputReady } from '@src/service/calculator'
import { useAppDispatch, useAppSelector } from '@src/store/hooks'

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
  // const country = useAppSelector((state) => state.country)
  // const [initialized, setInitialized] = useState(false)
  const loadStatus = useAppSelector((state) => state.rules.status)
  const error = useAppSelector((state) => state.rules.error)
  const [initialized, setInitialized] = useState(loadStatus === StateStatus.Succeeded)
  const calculatorStore = useSelector(selectCalculator)
  const initProductInput = (v: number | undefined) => (v ? v : 0)
  const [length, setLength] = useState(initProductInput(calculatorStore.productInput?.length))
  const [width, setWidth] = useState(initProductInput(calculatorStore.productInput?.width))
  const [height, setHeight] = useState(initProductInput(calculatorStore.productInput?.height))
  const [weight, setWeight] = useState(initProductInput(calculatorStore.productInput?.weight))
  const [apparel, setApparel] = useState(calculatorStore.productInput?.isApparel === true)
  const [dangerous, setDangerous] = useState(calculatorStore.productInput?.isDangerous === true)
  const [price, setPrice] = useState(initProductInput(calculatorStore.productInput?.price))
  const [cost, setCost] = useState(initProductInput(calculatorStore.productInput?.cost))
  const [redayForCalculation, setRedayForCalculation] = useState(false)

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
  const handleCategoryChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    event.preventDefault()
    // console.log(event.target.value)
    dispatch(changeProductCategory(event.target.value as string))
  }
  const handleApparelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApparel(event.target.checked)
  }
  const handleDangerousChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDangerous(event.target.checked)
  }
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(parseFloat(event.target.value))
  }
  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCost(parseFloat(event.target.value))
  }

  const tryToCalculate = () => {
    dispatch(
      changeProductInput({
        productInput: { length, width, height, weight, isApparel: apparel, isDangerous: dangerous, price, cost },
      })
    )
    const ready = checkProductInputReady()
    setRedayForCalculation(ready)
    if (ready) {
      // TODO calculate need by country
      dispatch(calculate({}))
    }
  }
  const handleLoadClick = () => {
    // TODO load need country

    dispatch(changeLoadStatus({ status: true }))
    dispatch(fetchRuleContent()).then((value) => {
      if (value.type === 'rules/fetchRuleContent/fulfilled') {
        setInitialized(true)
      } else if (value.type === 'rules/fetchRuleContent/rejected') {
        // console.log('Fail to load ', value.error.message)
      }
      dispatch(changeLoadStatus({ status: false }))
    })
  }
  const handleEstimate = () => {
    dispatch(estimate({}))
  }

  useEffect(() => {
    if (loadStatus === StateStatus.Succeeded) {
      setInitialized(true)
    } else {
      setInitialized(false)
    }
  }, [loadStatus, dispatch])
  useEffect(() => {
    // console.log('effect!!! length = ', length, ' width = ', width, ' height = ', height)
    const fbaFee = 3.5
    const referralFee = 2.6
    const closingFee = 0
    tryToCalculate()
  }, [length, width, height, weight, apparel, dangerous, cost, price])

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
                <Grid item xs={4}>
                  <InputLabel id="category">Product category:</InputLabel>
                  <Select
                    id="select"
                    labelId="category"
                    value={calculatorStore.productInput.categoryCode ? calculatorStore.productInput.categoryCode : ''}
                    onChange={handleCategoryChange}
                  >
                    {categoryItems.map((item) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={apparel} onChange={handleApparelChange} name="checkedB" color="primary" />
                    }
                    label="Apparel"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={dangerous} onChange={handleDangerousChange} name="checkedB" color="primary" />
                    }
                    label="Dangerous"
                  />
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Divider orientation="vertical" flexItem />
              </Grid>
              <Grid container item spacing={2} xs={6} className={classes.root} justify="center">
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
                    id="price-value"
                    defaultValue="0"
                    type="number"
                    variant="outlined"
                    error
                    required
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    onChange={handlePriceChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>Tier</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="tier-value"
                    value={calculatorStore.tier?.type || 'Unknown'}
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
                    id="cost-value"
                    defaultValue="0"
                    type="number"
                    variant="outlined"
                    size="small"
                    error
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
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
                    value={`$${calculatorStore.productFees.fbaFee}`}
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
                    value={`$${calculatorStore.productFees.totalFee}`}
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
                    value={`$${calculatorStore.productFees.referralFee}`}
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
                    value={`$${calculatorStore.productFees.net}`}
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
                    value={`$${calculatorStore.productFees.closingFee}`}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={5}>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    disabled={redayForCalculation && calculatorStore.productInput.categoryCode && price > 0 ? false : true}
                    onClick={handleEstimate}
                  >
                    Estimate
                  </Button>
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
                disabled={calculatorStore.loading || !!error}
                onClick={handleLoadClick}
              >
                {calculatorStore.loading ? 'Loading' : 'Load'}
              </Button>
            </Typography>
            {error && (
              <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                Error : {error}
                You need to pick another country to retry.
              </Typography>
            )}
          </Container>
        )}
      </div>
    </Container>
  )
}
export default Calculator
