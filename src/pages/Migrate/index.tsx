/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { CurrencyAmount } from '@aliumswap/sdk'
import { CardBody, Button, Heading } from '@aliumswap/uikit'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import CardNav from 'components/CardNav'
import { GreyCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import { BottomGrouping, Wrapper } from 'components/swap/styleds'
import { TYPE } from 'components/Shared'
import { useActiveWeb3React } from 'hooks'
import { useVampireContract } from 'hooks/useContract'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import { useMigrateInfo, useMigrateActionHandlers, useSwapState } from 'state/swap/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { WrappedTokenInfo } from 'state/lists/hooks'
import { VAMPIRE_ADDRESS } from 'config/contracts'
import { useToken } from 'hooks/Tokens'
import { Dots } from '../Pool/styleds'
import AppBody from '../AppBody'

const { main: Main } = TYPE

const CardWrapper = styled.div`
  width: 100%;
`

const StyledCardHeader = styled.div`
  border-bottom: 1px solid #f4f5fa;
  padding: 24px 30px;
`

const ButtonWrap = styled.div`
  margin-top: 15px;
  max-width: 50%;
`

function useTokenAddress(props) {
  const [tokenInfo, setTokenInfo] = useState<any>()
  const Info = useToken(props)

  useEffect(() => {
    if (Info && Info !== null) {
      setTokenInfo(Info)
    }
  }, [Info])

  return tokenInfo
}

function Migrate() {
  const vampire: any = useVampireContract()

  const [lpList, setLpList] = useState<any>()
  const { account, chainId } = useActiveWeb3React()
  const [tokenList, setTokenList] = useState<any>([])

  useEffect(() => {
    async function getLpTokens() {
      const tokens: Array<any> = await vampire?.lpTokensInfoLength().then(async (response: TransactionResponse) => {
        const length = +response.toString()
        const temp = await Promise.all(
          [...Array(length).keys()].map(async (item) => {
            const address = await vampire.lpTokensInfo(item).then((resp: any) => resp.lpToken)
            const parents = await vampire.lpTokenDetailedInfo(item).then((resp: any) => resp)
            return { address, ...{ left: parents[0] }, right: parents[1] }
          })
        )
        return temp
      })
      if (JSON.stringify(tokenList) !== JSON.stringify(tokens)) setTokenList(tokens)
    }
    getLpTokens()
  }, [tokenList, vampire])

  const useBaseTokenInfo = (n) =>
    [...Array(n)].map((_, i) => ({
      left: useTokenAddress(tokenList[i]?.left),
      right: useTokenAddress(tokenList[i]?.right),
    }))
  const filteredTokenInfo = useBaseTokenInfo(10).filter((item) => item.left !== undefined && item.right !== undefined)

  useEffect(() => {
    const enrichedTokenInfo = tokenList.map((_, i) => {
      const id: any = chainId
      const info = new WrappedTokenInfo(
        {
          name: `ALium ${filteredTokenInfo[i]?.left?.name} / ${filteredTokenInfo[i]?.right?.name} LP Token`,
          symbol: `${filteredTokenInfo[i]?.left?.symbol} / ${filteredTokenInfo[i]?.right?.symbol} LP`,
          address: tokenList[i].address,
          chainId: id,
          decimals: 18,
        },
        []
      )
      return info
    })
    if (JSON.stringify(enrichedTokenInfo) !== JSON.stringify(lpList)) setLpList(enrichedTokenInfo)
  }, [lpList, chainId, filteredTokenInfo, tokenList])

  const { independentField, typedValue } = useSwapState()

  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: migrateInputError } = useMigrateInfo()

  const isValid = !migrateInputError

  const { wrapType } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const trade = v2Trade

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onCurrencySelection, onUserInput } = useMigrateActionHandlers()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.INPUT],
    chainId && VAMPIRE_ADDRESS[chainId]
  )
  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  const handleMigrate = () => {
    const tokenAmount = BigNumber.from(parsedAmounts[Field.INPUT]?.raw.toString())
    const activeToken: any = currencies[Field.INPUT]

    const numOfActiveToken = lpList.findIndex((item) => item.address === activeToken?.address).toString()
    const args = [numOfActiveToken, tokenAmount]

    vampire.estimateGas
      .deposit(...args, { from: account })
      .then((estimatedGasLimit) => {
        vampire
          .deposit(...args, { from: account, gasLimit: estimatedGasLimit })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .then((resp) => {
            // setTxHash(resp.hash);
          })
          .catch((err) => {
            console.error(err)
          })
      })
      .catch((err) => console.error(err))
  }

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection, setApprovalSubmitted]
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  return (
    <CardWrapper>
      <CardNav activeIndex={2} />
      <AppBody>
        <StyledCardHeader>
          <Heading color="heading">Migrate</Heading>
        </StyledCardHeader>
        <Wrapper id="swap-page">
          <CardBody>
            <AutoColumn gap="md">
              <CurrencyInputPanel
                label="Quantity"
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={!atMaxAmountInput}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                onCurrencySelect={handleInputSelect}
                // otherCurrency=currencies[Field.INPUT]}
                currencyList={lpList}
                id="swap-currency-input"
              />
            </AutoColumn>
            <ButtonWrap>
              <BottomGrouping>
                {!account ? (
                  <ConnectWalletButton fullwidth />
                ) : (
                  <AutoColumn gap="sm">
                    {approval === ApprovalState.UNKNOWN && (
                      <GreyCard style={{ textAlign: 'center' }}>
                        <Main mb="4px">
                          {currencies[Field.INPUT] ? 'Enter an amount' : 'Please, choose your token'}
                        </Main>
                      </GreyCard>
                    )}
                    {(approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING) && (
                      <RowBetween>
                        <Button onClick={approveCallback} disabled={approval === ApprovalState.PENDING}>
                          {approval === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.INPUT]?.symbol}</Dots>
                          ) : (
                            `Approve ${currencies[Field.INPUT]?.symbol}`
                          )}
                        </Button>
                      </RowBetween>
                    )}
                    {approval === ApprovalState.APPROVED && (
                      <Button
                        onClick={handleMigrate}
                        disabled={!isValid || approval !== ApprovalState.APPROVED}
                        variant={parsedAmounts[Field.INPUT] ? 'primary' : 'danger'}
                        fullwidth
                      >
                        {migrateInputError ?? 'Migrate'}
                      </Button>
                    )}
                  </AutoColumn>
                )}
              </BottomGrouping>
            </ButtonWrap>
          </CardBody>
        </Wrapper>
      </AppBody>
      <AdvancedSwapDetailsDropdown trade={trade} />
    </CardWrapper>
  )
}

export default Migrate
