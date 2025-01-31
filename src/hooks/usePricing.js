import { useContext } from "react";

import { PricingContext } from "../contexts/PricingContext";

 

// ----------------------------------------------------------------------

 

const usePricing = () => useContext(PricingContext);

 

export default usePricing;