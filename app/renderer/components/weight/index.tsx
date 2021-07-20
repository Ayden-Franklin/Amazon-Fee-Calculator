import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { fetchRuleContent } from '@src/store/dimensionalWeightSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'

function WeightRule() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.dimensionalWeight.content)
  const loadStatus = useAppSelector((state) => state.dimensionalWeight.status)
  const error = useAppSelector((state) => state.dimensionalWeight.error)

  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent())
    }
  }, [loadStatus, dispatch])
  return OriginalPage({ loadStatus, pageContent })
}
export default WeightRule
