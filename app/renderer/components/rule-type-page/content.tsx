import React from 'react'
import Box from '@material-ui/core/Box'
import { StateStatus } from '@src/renderer/constants'
function RuleContentPage({ loadStatus, pageContent, error }: RuleContentPageProps): JSX.Element {
  let content = <div className="loader">Loading...</div>
  if (loadStatus === StateStatus.Succeeded) {
    if (!pageContent || typeof pageContent === 'string') {
      content = <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    }
    if (pageContent && typeof pageContent === 'object') {
      content = (
        <>
          {Object.entries(pageContent).map(([key, value]) => (
            <React.Fragment key={key}>
              <h1>{key}</h1>
              <div dangerouslySetInnerHTML={{ __html: `${value}` }} />
            </React.Fragment>
          ))}
        </>
      )
    }
  } else if (loadStatus === StateStatus.Failed) {
    content = <div>{error}</div>
  }
  return <Box m={2}>{content}</Box>
}
export default RuleContentPage
export interface RuleContentPageProps {
  loadStatus: StateStatus
  pageContent: string
  error?: string
}
