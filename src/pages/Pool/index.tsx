import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from '@alium-official/sdk'
import { Button, CardBody, Text } from '@alium-official/uikit'

import { Link } from 'react-router-dom'
import CardNav from 'components/CardNav'
import Question from 'components/QuestionHelper'
import FullPositionCard from 'components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { StyledInternalLink, TYPE } from 'components/Shared'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'

import { useActiveWeb3React } from 'hooks'
import { usePairs } from 'data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { Dots } from 'components/swap/styleds'
import PageHeader from 'components/PageHeader'
import { useTranslation } from 'react-i18next'
import UnlockButton from 'components/ConnectWalletButton'
import AppBody from '../AppBody'

const { body: Body } = TYPE

const CardWrapper = styled.div`
  width: 100%;
`

const StyledCardBody = styled.div<{ singleBlock?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 34px 24px 32px 24px;
  align-items: center;
  // max-width: 48%;
  height: 114px;
  border-bottom: 1px solid #f4f5fa;

  > div {
    text-align: center;
  }

  > div:last-child {
    flex-basis: 80%;
  }

  > div:first-child {
    display: flex;
    > button {
      margin-top: 0;
    }
  }

  > a {
    width: 173px;
  }

  @media screen and (max-width: 461px) {
    flex-direction: column-reverse;
    height: 196px;
    padding: 26px 24px 32px 24px;

    ${({ singleBlock }) =>
            singleBlock &&
            `
      padding: 0; 
      height: 96px;
      flex-direction: row;
      padding-left: 16px;
      > div {
        flex-basis: 0 !important;
      }
    `}

    > div {
      flex-basis: 60%;
    }

    > button {
      width: 100%;
    }
  }
`

interface StyledLiquidityProps {
  found?: boolean
}

const StyledLiquidity = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  ${(props: StyledLiquidityProps) =>
          props.found &&
          `
    justify-content: flex-start;
    border-bottom: 1px solid #F4F5FA;
    padding: 16px;
  `}
  @media screen and (max-width: 414px) {
  padding-left: 24px;
}
`

const StyledRightSide = styled.div``

const StyledYourLiquidity = styled.div`
  margin: 24px;
  border: 1px solid #f4f5fa;
  box-sizing: border-box;
  border-radius: 6px;

  @media screen and (max-width: 376px) {
    margin: 16px;
  }
`

const StyledFoundLiquidity = styled.div`
  padding: 16px;
  overflow-y: auto;
  > div:not(:last-child) {
    border-bottom: 1px solid #f4f5fa;
  }
`

const StyledFullPositionCard = styled.div`
  div {
    padding: 6px 6px 6px 2px;
    border: none;
  }
  div:hover {
    border: none;
  }
  > a {
    width: auto !important;
  }
  > div > div > div div:last-child {
    justify-content: flex-start;
  }

  > div > div > div div:last-child a {
    margin-right: 20px;
  }
  @media screen and (max-width: 576px) {
    div {
      padding: 6px 6px 6px 0;
    }
  }
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account /* , chainId */ } = useActiveWeb3React()
  const { t } = useTranslation()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )
  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))
  const getButton = () => {
    return (
      // chainId === 56 || chainId === 128 ?
      // (
      //   <Button disabled style={{ background: "#CBC8EE" }} id="join-pool-button" as={Link} to="/add/ETH">
      //     {t('addLiquidity')}
      //   </Button>
      // ) : (
      <Button id="join-pool-button" as={Link} to="/add/ETH">
        {t('addLiquidity')}
      </Button>
      // )
    )
  }
  return (
    <CardWrapper>
      <CardNav activeIndex={1} />
      <AppBody>
        <PageHeader title={t('mainMenu.liquidity')} description={t('liquidityDescription')} />
        <StyledCardBody singleBlock={allV2PairsWithLiquidity?.length > 0}>
          {!account ? <UnlockButton /> : getButton()}
          <StyledRightSide>
            {allV2PairsWithLiquidity?.length === 0 && (
              <>
                <StyledLiquidity>
                  <Text color={theme.colors.text}>{t('yourLiquidity')}</Text>
                  <Question text={t('questionHelperMessages.addLiquidity')} />
                </StyledLiquidity>
                {!account ? (
                  <LightCard>
                    <Body color={theme.colors.textDisabled} textAlign="center" style={{ fontSize: '14px' }}>
                      {t('liquidityConnectToWallet')}
                    </Body>
                  </LightCard>
                ) : v2IsLoading ? (
                  <LightCard>
                    <Body color={theme.colors.textDisabled} textAlign="center">
                      <Dots>{t('loading')}</Dots>
                    </Body>
                  </LightCard>
                ) : allV2PairsWithLiquidity?.length > 0 ? (
                  <>
                    {allV2PairsWithLiquidity.map((v2Pair) => (
                      <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                    ))}
                  </>
                ) : (
                  <LightCard>
                    <Body color={theme.colors.textDisabled} textAlign="center">
                      {t('liquidityNotFound')}
                    </Body>
                  </LightCard>
                )}
              </>
            )}
          </StyledRightSide>
        </StyledCardBody>
        {allV2PairsWithLiquidity?.length > 0 && (
          <StyledYourLiquidity>
            <StyledLiquidity found>
              <Text color={theme.colors.text}>{t('yourLiquidity')}</Text>
              <Question text={t('questionHelperMessages.addLiquidity')} />
            </StyledLiquidity>
            <StyledFoundLiquidity>
              {allV2PairsWithLiquidity.map((v2Pair) => (
                <StyledFullPositionCard key={v2Pair.liquidityToken.address}>
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                </StyledFullPositionCard>
              ))}
            </StyledFoundLiquidity>
          </StyledYourLiquidity>
        )}
        <AutoColumn gap="lg">
          <CardBody>
            <AutoColumn gap="12px" style={{ width: '100%' }}>
              <div>
                <Text fontSize="14px" style={{ padding: '.5rem 0 .5rem 0' }}>
                  {t('noJoinedPool')}{' '}
                  <StyledInternalLink id="import-pool-link" to="/find">
                    {t('importPoolMessage')}
                  </StyledInternalLink>
                </Text>
                {/* <Text fontSize="14px" style={{ padding: '.5rem 0 .5rem 0' }}>
                  Or, if you staked your FLIP tokens in a farm, unstake them to see them here.
                </Text> */}
              </div>
            </AutoColumn>
          </CardBody>
        </AutoColumn>
      </AppBody>
    </CardWrapper>
  )
}
