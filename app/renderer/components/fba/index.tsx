import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import Box from '@material-ui/core/Box'
import { fetchRuleContent } from '@src/store/fbaSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'

function FBATable() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.fba.content)
  const loadStatus = useAppSelector((state) => state.fba.status)
  const error = useAppSelector((state) => state.fba.error)
  const country = useAppSelector((state) => state.country)

  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent(country.code))
    }
  }, [loadStatus, dispatch, country.code])
  return OriginalPage({ loadStatus, pageContent })
}
export default FBATable
