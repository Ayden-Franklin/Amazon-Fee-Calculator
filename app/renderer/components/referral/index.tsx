import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import Box from '@material-ui/core/Box'
import { fetchRuleContent } from '@src/store/referralSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'

function ReferralTable() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.referral.content)
  const loadStatus = useAppSelector((state) => state.referral.status)
  const error = useAppSelector((state) => state.referral.error)
  const country = useAppSelector((state) => state.country)

  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent(country.code))
    }
  }, [loadStatus, dispatch, country.code])
  return OriginalPage({ loadStatus, pageContent })
}
export default ReferralTable
