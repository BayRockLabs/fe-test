const SEARCH_KEY = [
  "uuid",
  "date_created",
  "date_updated",
  "name",
  "market_cost",
  "market_price",
  "status",
];

export function applySortFilter({ tableData, comparator, filterValue }) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterValue) {
    tableData = tableData.filter((item) =>
      Object.keys(item).some((key) =>
        SEARCH_KEY.includes(key)
          ? item[key]
              .toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          : false
      )
    );
  }

  return tableData;
}
