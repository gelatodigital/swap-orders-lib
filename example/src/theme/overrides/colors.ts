import { Colors } from '../styled'

const white = '#FFFFFF'
const black = '#000000'

export default function colors(darkMode: boolean): Colors {
  return {
    heading3: darkMode ? '#FFFFFF' : '#1E1E1E',
    heading6: darkMode ? '#FFFFFF' : '#212429',

    bgHover: darkMode ? '#212429' : '#F7F8FA',
    border: darkMode ? '#2C2F36' : '#E5E5E5',
    borderHover: darkMode ? '#C5C5C5' : '#E5E5E5',
    iconHover: darkMode ? '#212429' : '#F9F9F9',

    backIcon: darkMode ? '#FFFFFF' : '#525252',

    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#565A69',
    text3: darkMode ? '#6C7284' : '#888D9B',
    text4: darkMode ? '#565A69' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    text6: darkMode ? '#FFFFFF' : '#565A69',
    text7: darkMode ? '#FFFFFF' : '#868686',
    text8: darkMode ? '#fd90a7' : '#fd90a7',
    text9: darkMode ? '#99b2f7' : '#99b2f7',
    text10: darkMode ? '#c3c5ca' : '#575A68',
    text11: darkMode ? '#CACACA' : '#575A68',
    text12: darkMode ? '#E5E5E5' : '#575a68',
    text13: darkMode ? '#fff' : '#212329',

    // backgrounds / greys
    bg0: darkMode ? '#191B1F' : '#fff',
    bg1: darkMode ? '#212429' : '#F7F8FA',
    bg2: darkMode ? '#2C2F36' : '#EDEEF2',
    bg3: darkMode ? '#40444F' : '#CED0D9',
    bg4: darkMode ? '#565A69' : '#888D9B',
    bg5: darkMode ? '#6C7284' : '#888D9B',
    bg6: darkMode ? '#1A2028' : '#6C7284',
    bg7: darkMode ? '#212429' : '#fff',
    bg8: darkMode ? '#222429' : '#F7F8FA',
    bg9: darkMode ? '#1B1A1F' : '#EDEEF2',
    bg10: darkMode ? '#212429' : '#f7f8fa',
    bg11: darkMode ? '#D90067' : '#FC157B',
    bg12: darkMode ? '#595959' : '#e5e5e5',
    bg13: darkMode ? '#212429' : '#F7F8FA',
    bg14: darkMode ? '#1B1A1F' : '#fff',

    border1: darkMode ? '#595959' : '#CED0D9',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#2172E5' : '#ff007a',
    primary2: darkMode ? '#3680E7' : '#FF8CC3',
    primary3: darkMode ? '#4D8FEA' : '#FF99C9',
    primary4: darkMode ? '#376bad70' : '#F6DDE8',
    primary5: darkMode ? '#153d6f70' : '#FDEAF1',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#ff007a',

    // secondary colors
    secondary1: darkMode ? '#2172E5' : '#ff007a',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // other
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    red4: '#FF017A',
    red5: '#ff007a',
    red6: '#FF7C91',

    green1: '#27AE60',

    yellow1: '#e3a507',
    yellow2: '#ff8f00',
    yellow3: '#F3B71E',

    blue1: '#2172E5',
    blue2: '#5199FF',
    blue3: '#0F709F',
    blue4: '#5090EA',

    error: '#FD4040',
    success: '#27AE60',
    warning: '#ff8f00',

    progressBarBackgroundColor: darkMode ? '#191b1f' : '#fff',
    progressBarBorderColor1: darkMode ? 'rgba(103, 105, 116, 0.2)' : 'rgba(103, 105, 116, 0.1)',
    progressBarBorderColor2: darkMode ? '#fff' : '#000',

    tabTextStyle: darkMode
      ? '-webkit-background-clip: text; background-clip: text; background-image: linear-gradient(270deg, #96B1FE 0%, #F1A3BB 50.52%, #FFC78F 100%); color: transparent;'
      : 'color: #212329;',

    dropdownShadow: darkMode ? '1px 1px 6px rgba(255, 255, 255, 0.25)' : '1px 1px 6px rgba(0, 0, 0, 0.25)',
    dropdownItemTextColor: darkMode ? '#fff' : '#212329',
    dropdownItemHoverBackground: darkMode ? '#212429' : '#f7f8fa',
    dropdownItemHoverBorder: darkMode ? '#878787' : '#f7f8fa',
  }
}
