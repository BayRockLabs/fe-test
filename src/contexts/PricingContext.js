import PropTypes from "prop-types";
import { createContext, useState } from "react";
 

// ----------------------------------------------------------------------
const initialState = {
  uuid: "",
  name: "",

};

const PricingContext = createContext(initialState);

// -----------------------------------------------------------------

PricingProvider.propTypes = {
  children: PropTypes.node,

};


function PricingProvider({ children }) {
  const [selectedPricing, setSelectedPricing] = useState({
    uuid: initialState.uuid,
    name: initialState.name,
  });

  return (
    <PricingContext.Provider
      value={{
        selectedPricing,
        setSelectedPricing,
      }}
    >
      {children}
    </PricingContext.Provider>
  );

}

export { PricingProvider, PricingContext };