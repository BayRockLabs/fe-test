// import React from 'react'
// import maintenance from "../assets/maintenance.jpg"
// function ResourceManagement() {
//   return (
//     <div>
//       <img
        
//         src={maintenance}
//       />
//     </div>
//   )
// }

// export default ResourceManagement

import { Outlet } from "react-router-dom";

export default function ResourceManagement() {
  return <Outlet />;
}