import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SearchTableToolbar from '../clients/SearchTableToolbar';
import { Box, createStyles, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';

export default function BasicTable({ dataList, tableType, isLoading }) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [visibleCount, setVisibleCount] = React.useState(10);

  const handleSearch = React.useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleViewMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  const filteredData = dataList.filter((row) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    if (tableType === "Role" && row.designation.toLowerCase().includes(lowerCaseQuery)) {
      return true;
    }
    if (tableType === "Skill" && row.skill.toLowerCase().includes(lowerCaseQuery)) {
      return true;
    }
    if (tableType === "Country" && row.region.toLowerCase().includes(lowerCaseQuery)) {
      return true;
    }
    return false;
  });

  const sortFilteredDataDescending = (data) => {
    return data.sort((a, b) => b.number_of_resources - a.number_of_resources);
  };

  const sortedData = sortFilteredDataDescending(filteredData);
  const paginatedData = sortedData.slice(0, visibleCount);

  const SearchFilterHeader = ({tableSearchBy}) => {
    return (
      <Box sx={styles.searchBarContainer}>
        <Box sx={{ ...styles.searchInput, width: "100%" }}>
          <SearchTableToolbar searchQuery={searchQuery} onSearch={handleSearch} tableSearchBy={tableSearchBy}/>
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={styles.loading}>
        <CircularProgress />
      </Box>
    );
  }

  const showViewMoreButton = filteredData.length > visibleCount;

  return (
    <>
      { tableType==="Role" &&<SearchFilterHeader tableSearchBy={" by designation"} />}
      { tableType==="Skill" &&<SearchFilterHeader tableSearchBy={" by skill"} />}
      { tableType==="Country" &&<SearchFilterHeader tableSearchBy={" by country"} />}
      <TableContainer component={Paper} sx={{ width: "100%" ,paddingTop:1}}>
        <Table aria-label="simple table">
          <TableHead sx={{ marginTop: "2px" }}>
            {tableType === "Role" && (
              <TableRow>
                <TableCell>Designation</TableCell>
                <TableCell align='center'>Resources</TableCell>
              </TableRow>
            )}
            {tableType === "Skill" && (
              <TableRow>
                <TableCell>Skill</TableCell>
                <TableCell align='center'>Resources</TableCell>
              </TableRow>
            )}
            {tableType === "Country" && (
              <TableRow>
                <TableCell>Region</TableCell>
                <TableCell>Emp Type</TableCell>
                <TableCell>Resources</TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableType === "Country" ? 3 : 2} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                if (tableType === "Role") {
                  return (
                    <TableRow hover key={`role-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ maxWidth: "100px" }}>
                        {row.designation}
                      </TableCell>
                      <TableCell align='center'>
                        {row.number_of_resources}
                      </TableCell>
                    </TableRow>
                  );
                }
                if (tableType === "Skill") {
                  return (
                    <TableRow hover key={`skill-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ maxWidth: "100px" }}>
                        {row.skill}
                      </TableCell>
                      <TableCell align='center'>
                        {row.number_of_resources}
                      </TableCell>
                    </TableRow>
                  );
                }
                if (tableType === "Country") {
                  return (
                    <TableRow hover key={`country-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ maxWidth: "90px" }}>
                        {row.region}
                      </TableCell>
                      <TableCell sx={{ maxWidth: "90px" }}>
                        {row.employee_type}
                      </TableCell>
                      <TableCell sx={{ maxWidth: "70px" }} align='center'>
                        {row.number_of_resources}
                      </TableCell>
                    </TableRow>
                  );
                }
                return null;
              })
            )}
          </TableBody>
        </Table>
        {showViewMoreButton && (
          <Box sx={{ display: 'flex', justifyContent: 'flexStart', margin: 1 }}>
            <Typography
              variant="body2"
              onClick={handleViewMore}
              sx={{ marginLeft:2, color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}
            >
              View More
            </Typography>
          </Box>
        )}
      </TableContainer>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
  },
  searchInput: {
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: "12px",
    width: "40%",
  },
  searchBarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 2,
  },
}));


