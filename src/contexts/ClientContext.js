import PropTypes from "prop-types";
import { createContext, useState, useEffect } from "react";

// ----------------------------------------------------------------------

const initialState = {
  uuid: "",
  name: "",
};

const ClientContext = createContext({
  selectedClient: initialState,
  setSelectedClient: () => {},
});

// ----------------------------------------------------------------------

ClientProvider.propTypes = {
  children: PropTypes.node,
};

function ClientProvider({ children }) {
  const [selectedClient, setSelectedClient] = useState(() => {
    const storedClientData = localStorage.getItem("selectedClient");
    try {
      return storedClientData ? JSON.parse(storedClientData) : initialState;
    } catch (error) {
      console.error("Failed to parse selectedClient from localStorage:", error);
      return initialState;
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("selectedClient", JSON.stringify(selectedClient));
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedClient, setSelectedClient]);

  return (
    <ClientContext.Provider
      value={{
        selectedClient,
        setSelectedClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export { ClientProvider, ClientContext };
