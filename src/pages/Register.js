import { Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Card, Link, Container, Typography } from "@mui/material";

import useResponsive from "../hooks/useResponsive";
import Page from "../components/Page";
import Logo from "../components/Logo";
import { RegisterForm } from "../sections/auth/register";
import AuthSocial from "../sections/auth/AuthSocial";
import useLocales from "../hooks/useLocales";

const RootStyle = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const HeaderStyle = styled("header")(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: "100%",
  display: "flex",
  alignItems: "center",
  position: "absolute",
  padding: theme.spacing(3),
  justifyContent: "space-between",
  [theme.breakpoints.up("md")]: {
    alignItems: "flex-start",
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 464,
  display: "flex",
  flexDirection: "column",
  justifyContent: "top",
  margin: theme.spacing(6, 0, 2, 2),
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Register() {
  const { translate } = useLocales();

  const smUp = useResponsive("up", "sm");
  const mdUp = useResponsive("up", "md");

  return (
    <Page title={translate("register")}>
      <RootStyle>
        <HeaderStyle>
          <Logo />
          {smUp && (
            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
              {translate("alreadyhaveaccount")} {""}
              <Link variant="subtitle2" component={RouterLink} to="/login">
                {translate("login")}
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        {mdUp && (
          <SectionStyle>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
            <img
              alt="register"
              src="/static/illustrations/illustration_register.png"
            />
          </SectionStyle>
        )}

        <Container>
          <ContentStyle>
            <Typography variant="h4" gutterBottom>
              {translate("register")}
            </Typography>

            <Typography sx={{ color: "text.secondary", mb: 5 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>

            <RegisterForm />

            <AuthSocial />

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "text.secondary", mt: 3 }}
            >
              {translate("agreement")}{" "}
              <Link underline="always" color="text.primary" href="#">
                {translate("termservice")}
              </Link>{" "}
              {translate("and")}{" "}
              <Link underline="always" color="text.primary" href="#">
                {translate("privacypolicy")}
              </Link>
              .
            </Typography>

            {!smUp && (
              <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
                {translate("alreadyhaveaccount")}{" "}
                <Link variant="subtitle2" to="/login" component={RouterLink}>
                  {translate("login")}
                </Link>
              </Typography>
            )}
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
