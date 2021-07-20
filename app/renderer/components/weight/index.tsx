import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import Box from '@material-ui/core/Box'
import { fetchRuleContent } from '@src/store/dimensionalWeightSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'

function WeightRule() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.dimensionalWeight.content)
  const loadStatus = useAppSelector((state) => state.dimensionalWeight.status)
  const error = useAppSelector((state) => state.dimensionalWeight.error)
  const country = useAppSelector((state) => state.country)

  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent(country.code))
    }
  }, [loadStatus, dispatch, country.code])
  return OriginalPage({ loadStatus, pageContent })
}
export default WeightRule
