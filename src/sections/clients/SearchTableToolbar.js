import PropTypes from "prop-types";
import { InputAdornment, TextField, CircularProgress } from "@mui/material";
import Iconify from "../../components/Iconify";
import React from "react";
import { makeStyles } from "@mui/styles";
import useLocales from "../../hooks/useLocales";

const useStyles = makeStyles((theme) => ({
  searchIcon: {
    color: theme.palette.text.disabled,
    width: 30,
    height: 20,
  },
}));

SearchTableToolbar.propTypes = {
  searching: PropTypes.bool,
  filterValue: PropTypes.string,
  onSearch: PropTypes.func,
  tableSearchBy:PropTypes.string,
};

export default function SearchTableToolbar({
  searching = false,
  searchQuery,
  onSearch,
  tableSearchBy,
}) {
  const styles = useStyles();
  const { translate } = useLocales();
  const [inputValue, setInputValue] = React.useState(searchQuery);
  const textFieldRef = React.useRef(null);

  React.useEffect(() => {
    focusSearchTextField();
  }, []);

  function focusSearchTextField() {
    if ((searchQuery?.length ?? 0) > 0) {
      textFieldRef.current.focus();
    }
  }

  function handleSubmit() {
    focusSearchTextField();
    onSearch(inputValue);
  }

  const handleInputChange = (event) => {
    const query = event.target.value;
    setInputValue(query);
    onSearch(query);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <TextField
      height="100px"
      id="search-bar"
      onChange={handleInputChange}
      label={`${translate("search")}` +`${tableSearchBy?tableSearchBy:""}`}
      fullWidth
      value={inputValue}
      onKeyDown={handleKeyDown}
      inputRef={textFieldRef}
      autoComplete="off"
      inputProps={{ maxLength: 30 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">
            {searching ? (
              <CircularProgress size={25} thickness={2} />
            ) : (
              <Iconify
                icon={"eva:search-fill"}
                className={styles.searchIcon}
                style={{ cursor: 'pointer' }}
                onClick={handleSubmit}
              />
            )}
          </InputAdornment>
        ),
      }}
    />

  );
}
