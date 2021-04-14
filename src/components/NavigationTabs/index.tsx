import React from 'react'
import styled from 'styled-components'
import { ButtonMenu, ButtonMenuItem, Flex, ArrowBackIcon } from '@aliumswap/uikit-beta'
import { darken } from 'polished'
import { NavLink, Link as HistoryLink } from 'react-router-dom'
import { RowBetween } from 'components/Row'
import QuestionHelper from 'components/QuestionHelper'
import TranslatedText from 'components/TranslatedText'
import { useTranslation } from 'react-i18next'

const Tabs = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const StyledAbsoluteLink = styled.a`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textDisabled};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.colors.text)};
  }
`

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textDisabled};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.colors.text)};
  }
`

const ActiveText = styled.div`
  font-weight: 600;
  font-size: 18px;
  margin-left: 16px;
  letter-spacing: -0.3px;
`

const StyledRowBetween = styled(RowBetween)`
  padding: 32px 32px 22px;
  @media screen and (max-width: 500px) {
    padding: 24px 32px 20px;
  }
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  return (
    <Tabs style={{ marginBottom: '20px' }}>
      <StyledNavLink id="swap-nav-link" to="/swap" isActive={() => active === 'swap'}>
        <TranslatedText translationId={8}>Swap</TranslatedText>
      </StyledNavLink>
      <StyledNavLink id="pool-nav-link" to="/pool" isActive={() => active === 'pool'}>
        <TranslatedText translationId={74}>Pool</TranslatedText>
      </StyledNavLink>
      <StyledAbsoluteLink id="migrate-nav-link" target="_blank" href="https://www.binance.org/en/panama">
        Bridge
      </StyledAbsoluteLink>
    </Tabs>
  )
}

export const Nav = ({ activeIndex = 0 }: { activeIndex?: number }) => (
  <ButtonMenu activeIndex={activeIndex} size="sm" variant="subtle">
    <ButtonMenuItem id="swap-nav-link" to="/swap" as={HistoryLink}>
      <TranslatedText translationId={8}>Swap</TranslatedText>
    </ButtonMenuItem>
    <ButtonMenuItem id="pool-nav-link" to="/pool" as={HistoryLink}>
      <TranslatedText translationId={74}>Liquidity</TranslatedText>
    </ButtonMenuItem>
    <ButtonMenuItem id="migrate-nav-link" to="/migrate" as={HistoryLink}>
      Migrate
    </ButtonMenuItem>
  </ButtonMenu>
)

export function FindPoolTabs() {
  return (
    <Tabs>
      <StyledRowBetween style={{ borderBottom: '1px solid #f4f5fa' }}>
        <Flex alignItems="center">
          <HistoryLink to="/pool">
            <ArrowBackIcon width="24px" height="24px" />
          </HistoryLink>
          <ActiveText>Import Pool</ActiveText>
          <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
        </Flex>
      </StyledRowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  const { t } = useTranslation()
  return (
    <Tabs>
      <StyledRowBetween style={{ borderBottom: '1px solid #f4f5fa' }}>
        <Flex alignItems="center">
          <HistoryLink to="/pool">
            <ArrowBackIcon width="24px" height="24px" />
          </HistoryLink>
          <ActiveText>
            {adding ? 'Add' : 'Remove'} {t('mainMenu.liquidity')}
          </ActiveText>
        </Flex>
        <QuestionHelper
          text={adding ? t('questionHelperMessages.addLiquidity') : t('questionHelperMessages.removeTokens')}
          bordered
        />
      </StyledRowBetween>
    </Tabs>
  )
}
