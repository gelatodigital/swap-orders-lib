import gapplication from "./gapplication/reducer";
import ruser from "./guser/reducer";
import granger from "./gorder/reducer";
import gmulticall from "./gmulticall/reducer";
import glists from "./glists/reducer";
import rtransactions from "./gtransactions/reducer";
import { configureStore } from "@reduxjs/toolkit";

export const GELATO_RANGE_PERSISTED_KEYS: string[] = [
  "rtransactions",
  "glists",
  "ruser",
];

export const gelatoRangeOrderReducers = {
  gapplication,
  ruser,
  granger,
  gmulticall,
  glists,
  rtransactions,
};

const store = configureStore({
  reducer: gelatoRangeOrderReducers,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
