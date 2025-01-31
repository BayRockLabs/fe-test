import PropTypes from "prop-types";
import { createContext, useCallback, useEffect, useReducer } from "react";

import useAxiosPrivate from "../hooks/useAxiosPrivate";
import UserAPI from "../services/UserService";

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  LOGIN: (state, action) => {
    const { user, isAuthenticated } = action.payload;

    return {
      ...state,
      isAuthenticated,
      user,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

const AuthContext = createContext({
  ...initialState,
  method: "jwt",
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const axiosPrivate = useAxiosPrivate();

  const getUserDetails = useCallback(
    async (type) => {
      try {
        const accessToken = localStorage.getItem("access");
        const isAuthenticated = !!accessToken;
        if (accessToken) {
          dispatch({
            type,
            payload: {
              isAuthenticated: true,
            },
          });
        } else {
          dispatch({
            type,
            payload: {
              isAuthenticated: false,
            },
          });
        }
      } catch (err) {
        dispatch({
          type,
          payload: {
            isAuthenticated: false,
          },
        });
      }
    },
    [axiosPrivate]
  );

  useEffect(() => {
    getUserDetails("INITIALIZE");
  }, [getUserDetails]);

  const login = async () => {
    await getUserDetails("LOGIN");
  };

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
