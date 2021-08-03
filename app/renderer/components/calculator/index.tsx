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
import { StateStatus } from '@src/renderer/constants'
import { getCategoryByCountryCode } from '@src/renderer/constants'
import { fetchRuleContent } from '@src/store/assetSlice'
import {
  selectCalculator,
  changeLoadStatus,
  changeProductInput,
  changeProductCategory,
  calculate,
} from '@src/store/calculatorSlice'
import { checkProductInputReady } from '@src/service/calculator'
import { useAppDispatch, useAppSelector } from '@src/store/hooks'
import { NotAvailable } from '@src/service/constants'

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
  const country = useAppSelector((state) => state.country)
  // const [initialized, setInitialized] = useState(false)
  const loadStatus = useAppSelector((state) => state.asset.status)
  const error = useAppSelector((state) => state.asset.error)
  const [initialized, setInitialized] = useState(loadStatus === StateStatus.Succeeded)
  const calculatorStore = useSelector(selectCalculator)

  const productInput = calculatorStore.productInput || {}

  const handleCategoryChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    event.preventDefault()
    // console.log(event.target.value)
    dispatch(changeProductCategory(event.target.value as string))
  }

  const onChangeProductInput =
    (field: string, value?: (event: any) => any) => (event: React.ChangeEvent<HTMLInputElement>) => {
      event && event.preventDefault()

      let resValue = null
      if (typeof value === 'function') {
        resValue = value(event)
      }

      if (typeof value === 'undefined') {
        resValue = parseFloat(event.target.value)
        resValue = isNaN(resValue) ? '' : resValue
      }

      dispatch(
        changeProductInput({
          productInput: { [field]: resValue },
        })
      )
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

  useEffect(() => {
    if (loadStatus === StateStatus.Succeeded) {
      setInitialized(true)
    } else {
      setInitialized(false)
    }
  }, [loadStatus, dispatch])
  useEffect(() => {
    if (checkProductInputReady()) {
      dispatch(calculate({}))
    }
  }, [calculatorStore.productInput])

  const displayFee = (fee: IFeeUnit) => `${fee.currency === NotAvailable ? '' : fee.currency}${fee.value}`

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
                <Grid item xs={6}>
                  <TextField
                    name="length"
                    variant="outlined"
                    required
                    fullWidth
                    id="length"
                    value={productInput?.length > 0 ? productInput?.length : ''}
                    label="Length"
                    autoFocus
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">inches</InputAdornment>,
                    }}
                    onChange={onChangeProductInput('length')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="width"
                    value={productInput?.width > 0 ? productInput?.width : ''}
                    label="Width"
                    name="width"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">inches</InputAdornment>,
                    }}
                    onChange={onChangeProductInput('width')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="height"
                    value={productInput?.height > 0 ? productInput?.height : ''}
                    label="Height"
                    name="height"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">inches</InputAdornment>,
                    }}
                    onChange={onChangeProductInput('height')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="weight"
                    value={productInput?.weight > 0 ? productInput?.weight : ''}
                    label="Unit weight"
                    name="weight"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">pounds</InputAdornment>,
                    }}
                    onChange={onChangeProductInput('weight')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel id="category">Product category:</InputLabel>
                  <Select
                    id="select"
                    labelId="category"
                    label="Product category:"
                    value={calculatorStore.productInput?.categoryName ?? calculatorStore.productInput?.category ?? ''}
                    onChange={handleCategoryChange}
                  >
                    {getCategoryByCountryCode(country.code).map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled
                        checked={productInput?.isApparel}
                        onChange={onChangeProductInput('isApparel', (event) => event.target.checked)}
                        name="checkedB"
                        color="primary"
                      />
                    }
                    label="Apparel"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={productInput?.isDangerous}
                        onChange={onChangeProductInput('isDangerous', (event) => event.target.checked)}
                        name="checkedB"
                        color="primary"
                      />
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
                    value={`${productInput?.length ?? 0} * ${productInput?.width ?? 0} * ${productInput?.height ?? 0}`}
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
                    type="number"
                    variant="outlined"
                    error
                    required
                    size="small"
                    value={productInput?.price}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    onChange={onChangeProductInput('price')}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>Tier</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="tier-value"
                    value={calculatorStore.tier?.name || 'Unknown'}
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
                    onChange={onChangeProductInput('cost')}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography>FBA Fee</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="tier-value"
                    disabled
                    value={`${calculatorStore.productFees.fbaFee.currency}${calculatorStore.productFees.fbaFee.value}`}
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
                    value={displayFee(calculatorStore.productFees.referralFee)}
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
                    value={displayFee(calculatorStore.productFees.closingFee)}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={5} />
              </Grid>
              {productInput.imageUrl && productInput.asin && (
                <Grid container item spacing={4} xs={5} className={classes.root} justify="center">
                  <Grid item xs={6}>
                    <img src={productInput.imageUrl} width="100%" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField name="asin" fullWidth id="asin" disabled value={productInput.asin} label="ASIN" />
                  </Grid>
                </Grid>
              )}
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
