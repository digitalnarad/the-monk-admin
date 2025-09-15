import { createSlice } from "@reduxjs/toolkit";
import storage from "../services/storage";
import api from "../services/api";

const initialState = {
  // Auth state
  authData: null,
  authToken: storage.get("token"),

  // loading state
  isPageLoading: false,

  // Error state
  errorData: {
    show: false,
    message: "",
    type: "",
  },
};
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setAuthData(state, action) {
      state.authData = action.payload;
    },
    setErrorData(state, action) {
      state.errorData = action.payload;
    },
    setAuthToken(state, action) {
      state.authToken = action.payload;
      console.log("action.payload", action.payload);
      // Save auth token to encrypted storage
      if (action.payload) {
        storage.set("token", action.payload);
      }
    },
    setPageLoading(state, action) {
      state.isPageLoading = action.payload;
    },
  },
});

export const handelCatch = (error) => async (dispatch) => {
  let status = error?.response?.status;
  // normalize message to string
  let rawMessage =
    error?.response?.data?.message ||
    error?.message ||
    error?.response?.data?.error ||
    "Something went wrong!";

  let message = "";
  try {
    if (typeof rawMessage === "string") message = rawMessage;
    else if (typeof rawMessage === "object" && rawMessage !== null) {
      // try common fields
      message = rawMessage.message || rawMessage.error || JSON.stringify(rawMessage);
    } else {
      message = String(rawMessage);
    }
  } catch (e) {
    message = "Something went wrong!";
  }

  let returnCatch = {
    status: status,
    message: message,
  };
  if (status === 401) {
    dispatch(throwError("Session is expired"));
    dispatch(setAuthData(null));
    storage.clear();
  } else {
    dispatch(
      setErrorData({
        show: true,
        message: message,
        type: "error",
      })
    );
  }
  return returnCatch;
};

export const showSuccess = (message) => async (dispatch) => {
  dispatch(
    setErrorData({
      show: true,
      message: message,
      type: "success",
    })
  );
};

export const throwError = (message) => async (dispatch) => {
  let newMessage = message;
  try {
    if (typeof message === "string") newMessage = message;
    else if (typeof message === "object" && message !== null) {
      newMessage = message.message || message.error || JSON.stringify(message);
    } else {
      newMessage = String(message || "Something went wrong!");
    }
  } catch (e) {
    newMessage = "Something went wrong!";
  }

  dispatch(
    setErrorData({
      show: true,
      message: newMessage,
      type: "error",
    })
  );
};

export const logout = () => async (dispatch) => {
  dispatch(setAuthToken(null));
  dispatch(setAuthData(null));
  storage.clear();
};

export const verifyToken = (token) => async (dispatch) => {
  try {
    if (!token) return;
    const res = await api.get("/auth/admin/me");
    if (res.status !== 200) {
      dispatch(throwError(res?.data?.message));
      dispatch(logout());
      return null;
    }
    dispatch(setAuthData(res?.data?.response?.user));
  } catch (error) {
    dispatch(handelCatch(error));
    dispatch(logout());
  }
};

export const { setAuthData, setErrorData, setAuthToken, setPageLoading } =
  globalSlice.actions;

export default globalSlice.reducer;
