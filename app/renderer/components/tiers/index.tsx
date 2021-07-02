import React, { useEffect, useState } from 'react';
import { loadTierTable } from '@src/service/http';
import Box from '@material-ui/core/Box';

function TiersTable() {
  const [pageContent, setPageContent] = useState('loading');
  useEffect(() => {
    async function fetchData() {
      const response = await loadTierTable();
      console.log('load successfully');
      setPageContent(response);
    }
    fetchData();
  }, []);
  return (
    <Box m={2}>
      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    </Box>
  );
}
export default TiersTable;
