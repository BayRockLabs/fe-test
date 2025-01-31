import React from "react";
import { Pagination } from "@mui/material";
import { useMediaQuery, ThemeProvider, useTheme } from "@mui/material";
import PaginationThemeOverrides from "./overrides/Pagination";

const ResponsivePagination = ({ count, page, onChange }) => {
  const theme = useTheme(); // Get the current theme
  const isMobile = useMediaQuery("(max-width:600px)");

  // Create a theme with pagination overrides
  const paginationTheme = {
    ...theme,
    components: {
      MuiPaginationItem: PaginationThemeOverrides(theme).MuiPaginationItem,
    },
  };

  return (
    <ThemeProvider theme={paginationTheme}> {/* Apply the custom theme */}
      <Pagination
        count={count} // Total pages passed as props
        page={page} // Current page
        siblingCount={isMobile ? 0 : 1} // Fewer sibling pages on mobile
        boundaryCount={isMobile ? 0 : 2} // Reduce boundary pages on mobile
        size={isMobile ? "small" : "medium"} // Smaller size on mobile
        hidePrevButton={false} // Show "Previous" button
        hideNextButton={false} // Show "Next" button
        onChange={onChange}
        color="primary"
        variant="outlined"
        shape="rounded"
      />
    </ThemeProvider>
  );
};

export default ResponsivePagination;
