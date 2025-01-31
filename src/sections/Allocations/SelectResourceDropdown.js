import { TextField } from "@mui/material";
import { Dropdown } from "react-bootstrap";

const SelectResourceDropdown = ({
  toggleText,
  handleSearchResource,
  rowIndex,
  resourceSearchQueries,
  searchedResources,
  checkResourceAlreadyAdded,
  handleResourceChange,
  row,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-basic"
        style={{
          width: 200,
          height: 54,
          backgroundColor: "white",
          color: "black",
          fontSize: 14,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {toggleText}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          width: 220,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "8px" }}>
          <TextField
            size="small"
            placeholder="Search Resource"
            onChange={(e) => handleSearchResource(e, rowIndex)}
            value={resourceSearchQueries[rowIndex] || ""}
          />
        </div>
        {resourceSearchQueries[rowIndex]?.length > 2 && (
          <div>
            <Dropdown.Divider />
            <p
              style={{
                fontSize: "12px",
                color: "blue",
                marginLeft: "10px",
              }}
            >
              Search Results:
            </p>
            {searchedResources[rowIndex]?.map((res) => {
              return (
                <Dropdown.Item
                  disabled={
                    (checkResourceAlreadyAdded(res.resource_id) &&
                      res.resource_id !== "BUDGETO123") ||
                    res.availability_status !== "Available"
                  }
                  key={res.resource_id}
                  onClick={() =>
                    handleResourceChange(
                      res.resource_id,
                      rowIndex,
                      row.role,
                      res
                    )
                  }
                >
                  {res.resource_name}
                </Dropdown.Item>
              );
            })}
          </div>
        )}
        <div>
          <Dropdown.Divider />
          <p
            style={{
              fontSize: "12px",
              color: "green",
              marginLeft: "10px",
            }}
          >
            System Suggested:
          </p>
        </div>
        {row.resource_data.map((resource) => {
          return (
            <Dropdown.Item
              key={resource.resource_id}
              onClick={() =>
                handleResourceChange(resource.resource_id, rowIndex, row.role)
              }
              disabled={
                checkResourceAlreadyAdded(resource.resource_id) ||
                resource.availability_status !== "Available"
              }
            >
              {resource.resource_name}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SelectResourceDropdown;
