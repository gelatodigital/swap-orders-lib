import { ThemeContext, DefaultTheme } from "styled-components";
import { useContext } from "react";

export default function useTheme(): DefaultTheme {
  return useContext(ThemeContext);
}
