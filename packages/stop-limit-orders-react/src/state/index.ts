import gapplication from "./gapplication/reducer";
import guser from "./guser/reducer";
import gstoplimit from "./gstoplimit/reducer";
import glists from "./glists/reducer";
import gmulticall from "./gmulticall/reducer";
import gstoplimittransactions from "./gstoplimittransactions/reducer";
import { configureStore } from "@reduxjs/toolkit";

export const GELATO_PERSISTED_KEYS: string[] = [
  "gstoplimittransactions",
  // "glists",
  "guser",
];

export const gelatoReducers = {
  gapplication,
  guser,
  gstoplimit,
  gmulticall,
  glists,
  gstoplimittransactions,
};

const store = configureStore({
  reducer: gelatoReducers,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
