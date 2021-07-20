import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { fetchRuleContent } from '@src/store/tiersSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'
function TiersTable() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.tier.content)
  const loadStatus = useAppSelector((state) => state.tier.status)
  const error = useAppSelector((state) => state.tier.error)
  const country = useAppSelector((state) => state.country)

  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent(country.code))
    }
  }, [loadStatus, dispatch, country.code])
  return OriginalPage({ loadStatus, pageContent })
}
export default TiersTable
