import { useContext } from "react";
import { ClientContext } from "../contexts/ClientContext";

// ----------------------------------------------------------------------

const useClient = () => useContext(ClientContext);

export default useClient;
