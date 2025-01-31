import PropTypes from "prop-types";
import { m, AnimatePresence } from "framer-motion";
// @mui
import { alpha } from "@mui/material/styles";
import {
  List,
  IconButton,
  ListItemText,
  ListItem,
  CircularProgress,
  Box,
  LinearProgress,
  Stack,
} from "@mui/material";
// utils
import { fData } from "../../utils/formatNumber";
import getFileData from "../../utils/getFileData";
//
import Image from "../Image";
import Iconify from "../Iconify";
import { varFade } from "../animate";
import DoneIcon from "@mui/icons-material/CheckCircle";
import { createStyles, useTheme } from "@mui/styles";
import PdfDocDefault from "../../assets/svg/PdfDocDefault";

// ----------------------------------------------------------------------

const useStyles = createStyles((theme) => ({
  progressStyle: {
    position: "absolute",
    display: "flex",
    gap: 2,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
    height: "100%",
  },

  previewImageStyle: {
    p: 0,
    m: 0.5,
    width: 80,
    height: 80,
    borderRadius: 1.25,
    overflow: "hidden",
    position: "relative",
    display: "inline-flex",
    border: (theme1) => `solid 1px ${theme1.palette.divider}`,
  },
}));
MultiFilePreview.propTypes = {
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func,
  showPreview: PropTypes.bool,
};

export default function MultiFilePreview({
  showPreview = false,
  showLoading = false,
  files,
  onRemove,
  progressList = {},
}) {
  const theme = useTheme();
  const styles = useStyles(theme);

  const hasFile = files?.length > 0;

  return (
    <List disablePadding sx={{ ...(hasFile && { my: 3 }) }}>
      <AnimatePresence>
        {files?.map((file, index) => {
          const { key, name, size, preview } = getFileData(file, index);
          const progress = progressList[index] ?? 0;
          const isCompleted = progress >= 100;
          if (showPreview) {
            return (
              <ListItem
                key={key}
                {...varFade().inRight}
                sx={styles.previewImageStyle}
              >
                <Image alt="preview" src={preview} ratio="1/1" />

                {onRemove && (
                  <IconButton
                    size="small"
                    onClick={() => onRemove(file, index)}
                    sx={{
                      top: 2,
                      p: "2px",
                      right: 2,
                      position: "absolute",
                      color: "common.white",
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.grey[900], 0.48),
                      },
                    }}
                  >
                    <Iconify icon={"eva:close-fill"} />
                  </IconButton>
                )}
                {progress > 0 && (
                  <Box
                    sx={styles.progressStyle}
                    styles={{
                      backgroundColor: isCompleted
                        ? "transparent"
                        : "action.focus",
                    }}
                  >
                    {isCompleted ? (
                      <DoneIcon color="success" />
                    ) : (
                      <CircularProgress
                        color="success"
                        variant="determinate"
                        value={progress}
                        size={30}
                        thickness={4}
                      />
                    )}
                  </Box>
                )}
              </ListItem>
            );
          }

          return (
            <ListItem
              key={key}
              // component={m.div}
              {...varFade().inRight}
              sx={{
                my: 1,
                px: 2,
                py: 0.75,

                borderRadius: 0.75,
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              {preview ? (
                <Box
                  sx={{
                    ...styles.previewImageStyle,
                    width: 60,
                    height: 60,
                    mr: 2,
                  }}
                >
                  {file.type?.includes("image") ? (
                    <Image alt="preview" src={preview} ratio="1/1" />
                  ) : (
                    <PdfDocDefault
                      sx={{ width: "100%", height: "100%", p: 1 }}
                    />
                  )}
                </Box>
              ) : (
                <Iconify
                  icon={preview}
                  sx={{ width: 28, height: 28, color: "text.secondary", mr: 2 }}
                />
              )}

              <Stack
                direction="column"
                sx={{ width: "100%", paddingBottom: 1 }}
                spacing={1}
              >
                <ListItemText
                  primary={typeof file === "string" ? file : name}
                  secondary={typeof file === "string" ? "" : fData(size || 0)}
                  primaryTypographyProps={{ variant: "subtitle2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
                {/* {!isCompleted && <LinearProgressWithLabel value={progress} />} */}
              </Stack>
              {isCompleted &&
                (showLoading ? (
                  <CircularProgress variant="indeterminate" size={20} />
                ) : (
                  <DoneIcon color="success" />
                ))}
              {onRemove && (
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onRemove(file, index)}
                >
                  <Iconify icon={"eva:close-fill"} />
                </IconButton>
              )}
            </ListItem>
          );
        })}
      </AnimatePresence>
    </List>
  );
}
