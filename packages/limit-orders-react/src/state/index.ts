import gapplication from "./gapplication/reducer";
import guser from "./guser/reducer";
import gorder from "./gorder/reducer";
import glists from "./glists/reducer";
import gmulticall from "./gmulticall/reducer";
import gtransactions from "./gtransactions/reducer";
import { configureStore } from "@reduxjs/toolkit";

export const GELATO_PERSISTED_KEYS: string[] = [
  "gtransactions",
  "glists",
  "guser",
];

export const gelatoReducers = {
  gapplication,
  guser,
  gorder,
  gmulticall,
  glists,
  gtransactions,
};

const store = configureStore({
  reducer: gelatoReducers,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
