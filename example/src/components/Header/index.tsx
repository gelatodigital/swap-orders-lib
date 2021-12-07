import useScrollPosition from '@react-hook/window-scroll'
import React from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { Moon, Sun } from 'react-feather'
import styled from 'styled-components/macro'
import { useActiveWeb3React } from '../../hooks/web3'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import SorbetLogo from '../../assets/svg/logo_text.svg'
import SorbetLogoOnly from '../../assets/svg/logo.svg'
import { isMobile } from 'react-device-detect'
import { YellowCard } from '../Card'
import Menu from '../Menu'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'

const HeaderFrame = styled.div<{ showBackground: boolean }>`
  align-items: center;
  display: grid;
  flex-direction: row;
  grid-template-columns: 120px 1fr 120px;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
  top: 0;
  z-index: 21;
  width: 100%;

  /* Background slide effect on scroll. */
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
    grid-template-columns: 120px 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    background-color: ${({ theme }) => theme.bg1};
    border-radius: 12px 12px 0 0;
    bottom: 0px;
    flex-direction: row;
    height: 72px;
    justify-content: space-between;
    justify-self: center;
    left: 0px;
    padding: 1rem;
    position: fixed;
    width: 100%;
    z-index: 99;
`};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    background-color: ${({ theme }) => theme.bg1};
    border-radius: 12px 12px 0 0;
    bottom: 0px;
    flex-direction: row;
    height: 72px;
    justify-content: space-between;
    justify-self: center;
    left: 0;
    padding: 1rem;
    position: fixed;
    right: 0;
    width: 100%;
    z-index: 99;
`};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto;
    width: auto;
  `};
`

const HeaderLinks = styled(Row)`
  background-color: ${({ theme }) => theme.bg0};
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  justify-self: center;
  margin: 0;
  overflow: auto;
  padding: 4px;
  width: fit-content;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: flex-end;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg2)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  border-radius: 12px;
  padding: 8px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const SorbetIcon = styled.div`
  transition: transform 0.3s ease;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap};

  align-items: left;
  border-radius: 3rem;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  padding: 4px 12px;
  text-decoration: none;
  white-space: nowrap;
  width: fit-content;

  &.${activeClassName} {
    background-color: ${({ theme }) => theme.bg2};
    border-radius: 12px;
    color: ${({ theme }) => theme.text1};
    font-weight: 600;
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg2};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const NETWORK_LABELS: { [chainId: number]: string } = {
  [1]: 'Ethereum',
  [4]: 'Rinkeby',
  [3]: 'Ropsten',
  [5]: 'Görli',
  [42]: 'Kovan',
  [56]: "BSC",
  [137]: 'Polygon (Matic)',
  [250]: 'Fantom',
  [43114]: 'AVAX',
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const scrollY = useScrollPosition()

  return (
    <HeaderFrame showBackground={scrollY > 45}>
      <HeaderRow>
        {isMobile ? (
          <Title href=".">
            <SorbetIcon>
              <img width={'46px'} src={SorbetLogoOnly} alt="logo" />
            </SorbetIcon>
          </Title>
        ) : (
          <Title href=".">
            <SorbetIcon>
              <img width={'174px'} src={SorbetLogo} alt="logo" />
            </SorbetIcon>
          </Title>
        )}
      </HeaderRow>
      <HeaderLinks>
        <StyledNavLink id={`limit-order-nav-link`} to={'/limit-order'}>
          Limit Orders
        </StyledNavLink>
        <StyledNavLink id={`stop-limit-nav-link`} to={'/stop-limit-order'}>
          Stop Limit Orders
        </StyledNavLink>
        <StyledNavLink id={`pools-nav-link`} to={'/range-order'}>
          Range Orders
        </StyledNavLink>
      </HeaderLinks>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} {chainId === 43114 ? 'AVAX' : chainId === 56 ? 'BNB' : chainId === 137 ? 'MATIC' : 'ETH'}
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}