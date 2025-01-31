import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import useLocales from "../hooks/useLocales";
import { Box, Tooltip } from "@mui/material";
import MandatoryTextField from "../pages/MandatoryTextField";

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

export default function MultipleSelectCheckmarks({
  setSkillOption,
  skillOption,
  setSelectedSkill,
  selectedSkill,
  disabledSkill,
}) {
  const { translate } = useLocales();

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSkill(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };
  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth>
        <InputLabel htmlFor="outlined-adornment-clientname">
          <MandatoryTextField label={translate("Skill")} />
        </InputLabel>
        <Select
          disabled={disabledSkill}
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedSkill}
          onChange={handleChange}
          input={<OutlinedInput label={translate("skill")} />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {skillOption.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={selectedSkill.indexOf(name) > -1} />
              <Tooltip title={name}>
                <ListItemText
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name.length > 24 ? `${name.slice(0, 24)}...` : name}
                </ListItemText>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
