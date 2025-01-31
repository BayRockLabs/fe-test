import React, { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstloading, setFirstLoading] = useState(false);

  useEffect(() => {
    const getLocalStorageData = localStorage.getItem("userData");
    const hasVisited = sessionStorage.getItem("sessionHasVisited");
    try {
      const parsedData = JSON.parse(getLocalStorageData);
      console.log("UserData-cache: ", parsedData);

      // console.log("visit", hasVisited);

      if (!hasVisited) {
        // Mark as visited for this session
        setFirstLoading(true);
        sessionStorage.setItem("sessionHasVisited", true);

        // Add any "first-load" actions you want to perform here
        console.log("First load of this session");
      }
      setUserData(parsedData);
    } catch (error) {
      console.error("Failed to parse userData from localStorage:", error);
      setUserData(null);
    } finally {
      setLoading(false); // Set loading to false after the data is processed
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        userData,
        setUserData,
        loading,
        setLoading,
        firstloading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
