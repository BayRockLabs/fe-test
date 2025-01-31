import { Outlet } from "react-router-dom";

import useLocales from "../hooks/useLocales";

import Page from "../components/Page";

export default function Contracts() {
  const { translate } = useLocales();

  return (
    <Page title={translate("Contracts")}>
      <Outlet />
    </Page>
  );
}
