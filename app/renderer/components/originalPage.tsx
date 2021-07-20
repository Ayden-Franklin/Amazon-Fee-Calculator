import React from 'react'
import Box from '@material-ui/core/Box'
import { StateStatus } from '@src/service/constants'
function OriginalPage({ loadStatus, pageContent, error }: OriginalPageProps): JSX.Element {
  let content = <div className="loader">Loading...</div>
  if (loadStatus === StateStatus.Succeeded) {
    content = <div dangerouslySetInnerHTML={{ __html: pageContent }} />
  } else if (loadStatus === StateStatus.Failed) {
    content = <div>{error}</div>
  }
  return <Box m={2}>{content}</Box>
}
export default OriginalPage
export interface OriginalPageProps {
  loadStatus: StateStatus
  pageContent: string
  error?: string
}
