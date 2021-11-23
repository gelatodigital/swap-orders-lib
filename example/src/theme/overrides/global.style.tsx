
import styled, { createGlobalStyle } from 'styled-components';
import colors from './colors';

export const ThemedBackground = styled.div<{ backgroundColor?: string | undefined }>`
  position: fixed;
  top: 0;
  left: calc(-100vw / 2);
  right: 0;
  pointer-events: none;
  /* max-width: 100vw !important; */
  width: 200vw;
  height: 200vh;
  mix-blend-mode: color;
  background: ${({ backgroundColor }) =>
    `radial-gradient(50% 50% at 50% 50%, ${
      backgroundColor ? backgroundColor : '#fc077d10'
    } 0%, rgba(255, 255, 255, 0) 100%)`};
  transform: translateY(-100vh);
  will-change: background;
  transition: background 450ms ease;
`

export const FixedGlobalStyle = createGlobalStyle`
  html, input, textarea, button {
    font-family: 'Inter', sans-serif;
    font-display: fallback;
  }
  @supports (font-variation-settings: normal) {
    html, input, textarea, button {
      font-family: 'Inter var', sans-serif;
    }
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  a {
    color: ${colors(false).blue1}; 
  }

  * {
    box-sizing: border-box;
  }

  button {
    user-select: none;
  }

  html {
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-feature-settings: 'ss01' on, 'ss02' on,  'cv01' on, 'cv03' on;
  }
`

export const ThemedGlobalStyle = createGlobalStyle`
  html {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg1};
  }

  body {
    min-height: 100vh;
    background-position: 0 -30vh;
    background-repeat: no-repeat;

  }
`