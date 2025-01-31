import PropTypes from "prop-types";
import { m } from "framer-motion";
import { alpha, styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import Logo from "./Logo";

const RootStyle = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.primary.contrastText,
  zIndex: 9999,
}));

const LoadingContent = styled("div")({
  display: "flex",
  alignItems: "center",
});

const TextWrapper = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginTop: theme.spacing(2),
}));

LoadingScreen.propTypes = {
  isDashboard: PropTypes.bool,
};

export default function LoadingScreen({ isDashboard, ...other }) {
  return (
    <RootStyle {...other}>
      <LoadingContent>
        {!isDashboard && (
          <Box
            component={m.div}
            animate={{
              scale: [1, 0.9, 0.9, 1, 1],
              opacity: [1, 0.48, 0.48, 1, 1],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeatDelay: 1,
              repeat: Infinity,
            }}
          >
            <Logo disabledLink sx={{ width: 64, height: 64 }} />
          </Box>
        )}

        <TextWrapper variant="subtitle1">Loading...</TextWrapper>
      </LoadingContent>
    </RootStyle>
  );
}

