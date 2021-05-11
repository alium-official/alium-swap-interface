import React, { FC, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, Percent, WETH, ChainId } from '@alium-official/sdk'
import { AddIcon, Button, Flex, Text } from '@alium-official/uikit'

import { ArrowDown, ChevronDown } from 'react-feather'

import { BigNumber } from '@ethersproject/bignumber'
import { ROUTER_ADDRESS } from 'config/contracts'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { useHistory, useParams } from 'react-router-dom'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import { RowBetween, RowFixed } from '../../components/Row'

import Slider from '../../components/Slider'
import CurrencyLogo from '../../components/CurrencyLogo'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { usePairContract } from '../../hooks/useContract'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { StyledInternalLink } from '../../components/Shared'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { ClickableText, Wrapper } from '../Pool/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { Dots } from '../../components/swap/styleds'
import { useBurnActionHandlers, useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'

import { Field } from '../../state/burn/actions'
import { useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'

const OutlineCard = styled.div`
  padding: 17px 24px;
  background-color: #f5f7ff;
`

const Body = styled.div`
  // padding-left: 24px;
  // padding-right: 24px;
`

const StyledAddIcon = styled.div`
  border: 1.5px solid #6c5dd3;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  margin-left: 20px;

  > * {
    margin: auto;
  }
`

const StyledTextAddIcon = styled.div`
  border: 1.5px solid #6c5dd3;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  margin: 10px 0;

  > * {
    margin: auto;
  }
`

export const RemoveLiquidity: FC = () => {
  const history = useHistory()
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId,
  ])

  // const theme = useContext(ThemeContext)

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    chainId && ROUTER_ADDRESS[chainId]
  )

  const onAttemptToApprove = async () => {
    if (!pairContract || !pair || !library) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')
    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const deadlineForSignature: number = Math.ceil(Date.now() / 1000) + deadline

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]
    const domain = {
      name: 'Alium LPs',
      version: '1',
      chainId,
      verifyingContract: pair.liquidityToken.address,
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS[chainId as ChainId],
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadlineForSignature,
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then((signature) => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadlineForSignature,
        })
      })
      .catch((e) => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (e?.code !== 4001) {
          approveCallback()
        }
      })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, val: string) => {
      setSignatureData(null)
      return _onUserInput(field, val)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback((val: string): void => onUserInput(Field.LIQUIDITY, val), [onUserInput])
  const onCurrencyAInput = useCallback((val: string): void => onUserInput(Field.CURRENCY_A, val), [onUserInput])
  const onCurrencyBInput = useCallback((val: string): void => onUserInput(Field.CURRENCY_B, val), [onUserInput])

  // tx sending
  const addTransaction = useTransactionAdder()

  const onRemove = async () => {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[]
    let args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow,
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow,
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }
    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName, index) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((e) => {
            console.error(`estimateGas failed`, index, methodName, args, e)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
              currencyA?.symbol
            } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`,
          })

          setTxHash(response.hash)
        })
        .catch((e: Error) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(e)
        })
    }
  }

  const modalHeader = async () => {
    return (
      <AutoColumn gap="md" style={{ marginTop: '0' }}>
        <RowBetween
          style={{ backgroundColor: '#F5F7FF', borderRadius: '6px', padding: '13px 16px' }}
          alignItems="center"
        >
          <Text fontSize="14px">{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyA} size="24px" />
            <Text fontSize="14px" style={{ marginLeft: '10px' }}>
              {currencyA?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <StyledAddIcon>
            <AddIcon color="#6C5DD3" width="12px" />
          </StyledAddIcon>
        </RowFixed>
        <RowBetween
          style={{ backgroundColor: '#F5F7FF', borderRadius: '6px', padding: '13px 16px' }}
          alignItems="center"
        >
          <Text fontSize="14px">{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyB} size="24px" />
            <Text fontSize="14px" style={{ marginLeft: '10px' }}>
              {currencyB?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <Text fontSize="14px" color="#8990A5">
          Output is estimated. If the price changes by more than{' '}
          <Text style={{ display: 'inline-block' }} fontSize="14px" color="#6C5DD3">
            {allowedSlippage / 100}%
          </Text>{' '}
          your transaction will revert.
        </Text>
      </AutoColumn>
    )
  }

  const StyledPriceContainer = styled.div`
    background-color: #f4f5fa;
    border-radius: 6px;
    padding: 6px 8px;
  `

  const modalBottom = async () => {
    return (
      <>
        <RowBetween style={{ padding: '6px 8px' }}>
          <Text color="#8990A5" fontSize="11px">
            {`${currencyA?.symbol}/${currencyB?.symbol}`} Burned
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin size={24} />
            <Text fontSize="11px" ml="8px">
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <StyledPriceContainer>
            <RowBetween>
              <Text color="#8990A5" fontSize="11px">
                Price
              </Text>
              <Text fontSize="11px" color="#6C5DD3">
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text fontSize="11px" color="#6C5DD3">
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </StyledPriceContainer>
        )}
        <Button
          disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
          onClick={onRemove}
          fullwidth
          style={{ marginBottom: '24px' }}
        >
          Confirm
        </Button>
      </>
    )
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId], currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  )

  const StyledWrapper = styled(Wrapper)`
    margin-top: 0;
  `

  return (
    <>
      <AppBody>
        <AddRemoveTabs adding={false} />
        <StyledWrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash || ''}
            content={() => (
              <ConfirmationModalContent
                title="You will receive"
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn>
            <Body>
              <OutlineCard>
                <AutoColumn gap="8px">
                  <RowBetween>
                    <Text style={{ color: '#8990A5', fontWeight: 500, letterSpacing: '0.3px', fontSize: '16px' }}>
                      Amount
                    </Text>
                    <ClickableText
                      onClick={() => {
                        setShowDetailed(!showDetailed)
                      }}
                      style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}
                    >
                      <Flex alignItems="center">
                        {showDetailed ? 'Simple' : 'Detailed'}
                        <ChevronDown width="16px" height="16px" />
                      </Flex>
                    </ClickableText>
                  </RowBetween>
                  <Flex justifyContent="start">
                    <Text
                      fontSize="40px"
                      style={{ color: '#0B1359', fontWeight: 700, letterSpacing: '0.3px', lineHeight: '1' }}
                    >
                      {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                    </Text>
                  </Flex>
                  {!showDetailed && (
                    <>
                      <Flex>
                        <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                      </Flex>
                      <Flex justifyContent="space-between">
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}
                          style={{ height: '24px', width: '37px', fontSize: '10px', fontWeight: 'bold' }}
                        >
                          25%
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}
                          style={{ height: '24px', width: '37px', fontSize: '10px', fontWeight: 'bold' }}
                        >
                          50%
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')}
                          style={{ height: '24px', width: '37px', fontSize: '10px', fontWeight: 'bold' }}
                        >
                          75%
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                          style={{ height: '24px', width: '37px', fontSize: '10px', fontWeight: 'bold' }}
                        >
                          Max
                        </Button>
                      </Flex>
                    </>
                  )}
                </AutoColumn>
              </OutlineCard>
            </Body>
            {!showDetailed && (
              <>
                <ColumnCenter>
                  <StyledTextAddIcon>
                    <ArrowDown size="12" color="#6C5DD3" />
                  </StyledTextAddIcon>
                </ColumnCenter>
                <Body>
                  <OutlineCard style={{ background: 'none', padding: '0 24px' }}>
                    <AutoColumn>
                      <RowBetween style={{ padding: '10px 16px' }}>
                        <Text fontSize="14px" style={{ fontWeight: 500 }}>
                          {formattedAmounts[Field.CURRENCY_A] || '-'}
                        </Text>
                        <RowFixed>
                          <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} />
                          <Text fontSize="14px" id="remove-liquidity-tokena-symbol" style={{ fontWeight: 500 }}>
                            {currencyA?.symbol}
                          </Text>
                        </RowFixed>
                      </RowBetween>
                      <RowBetween style={{ backgroundColor: '#F4F5FA', padding: '10px 16px', borderRadius: '6px' }}>
                        <Text fontSize="14px" style={{ fontWeight: 500 }}>
                          {formattedAmounts[Field.CURRENCY_B] || '-'}
                        </Text>
                        <RowFixed>
                          <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                          <Text fontSize="14px" id="remove-liquidity-tokenb-symbol" style={{ fontWeight: 500 }}>
                            {currencyB?.symbol}
                          </Text>
                        </RowFixed>
                      </RowBetween>
                      {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                        <RowBetween style={{ justifyContent: 'flex-end' }}>
                          {oneCurrencyIsETH ? (
                            <StyledInternalLink
                              to={`/remove/${currencyA === ETHER ? WETH[chainId].address : currencyIdA}/${
                                currencyB === ETHER ? WETH[chainId].address : currencyIdB
                              }`}
                            >
                              Receive WBNB
                            </StyledInternalLink>
                          ) : oneCurrencyIsWETH ? (
                            <StyledInternalLink
                              to={`/remove/${
                                currencyA && currencyEquals(currencyA, WETH[chainId]) ? 'ETH' : currencyIdA
                              }/${currencyB && currencyEquals(currencyB, WETH[chainId]) ? 'ETH' : currencyIdB}`}
                            >
                              Receive BNB
                            </StyledInternalLink>
                          ) : null}
                        </RowBetween>
                      ) : null}
                    </AutoColumn>
                  </OutlineCard>
                </Body>
              </>
            )}
            <Body style={{ padding: '24px' }}>
              {showDetailed && (
                <>
                  <CurrencyInputPanel
                    value={formattedAmounts[Field.LIQUIDITY]}
                    onUserInput={onLiquidityInput}
                    onMax={() => {
                      onUserInput(Field.LIQUIDITY_PERCENT, '100')
                    }}
                    showMaxButton={!atMaxAmount}
                    disableCurrencySelect
                    currency={pair?.liquidityToken}
                    pair={pair}
                    label="From"
                    id="liquidity-amount"
                    customHeight={43}
                  />
                  <ColumnCenter>
                    <StyledTextAddIcon>
                      <ArrowDown size="12" color="#6C5DD3" />
                    </StyledTextAddIcon>
                  </ColumnCenter>
                  <CurrencyInputPanel
                    hideBalance
                    value={formattedAmounts[Field.CURRENCY_A]}
                    onUserInput={onCurrencyAInput}
                    onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                    showMaxButton={!atMaxAmount}
                    currency={currencyA}
                    label="Output"
                    onCurrencySelect={handleSelectCurrencyA}
                    id="remove-liquidity-tokena"
                    customHeight={43}
                  />
                  <ColumnCenter>
                    <StyledTextAddIcon>
                      <AddIcon color="#6C5DD3" width="12px" />
                    </StyledTextAddIcon>
                  </ColumnCenter>
                  <CurrencyInputPanel
                    hideBalance
                    value={formattedAmounts[Field.CURRENCY_B]}
                    onUserInput={onCurrencyBInput}
                    onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                    showMaxButton={!atMaxAmount}
                    currency={currencyB}
                    label="Output"
                    onCurrencySelect={handleSelectCurrencyB}
                    id="remove-liquidity-tokenb"
                    customHeight={43}
                  />
                </>
              )}
              {pair && (
                <div style={{ padding: '32px 0' }}>
                  <Flex justifyContent="space-between" mb="8px">
                    <Text style={{ color: '#8990A5', fontSize: '14px', fontWeight: 500 }}>Price:</Text>
                    <Text style={{ color: '#0B1359', fontSize: '14px', fontWeight: 500 }}>
                      1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                    </Text>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <div />
                    <Text style={{ color: '#0B1359', fontSize: '14px', fontWeight: 500 }}>
                      1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                    </Text>
                  </Flex>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                {!account ? (
                  <ConnectWalletButton fullwidth />
                ) : (
                  <RowBetween>
                    <Button
                      onClick={onAttemptToApprove}
                      variant={approval === ApprovalState.APPROVED || signatureData !== null ? 'success' : 'primary'}
                      disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                      mr="8px"
                    >
                      {approval === ApprovalState.PENDING ? (
                        <Dots>Approving</Dots>
                      ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                        'Approved'
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowConfirm(true)
                      }}
                      disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                      variant={
                        !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                          ? 'danger'
                          : 'primary'
                      }
                    >
                      {error || 'Remove'}
                    </Button>
                  </RowBetween>
                )}
              </div>
            </Body>
          </AutoColumn>
        </StyledWrapper>
      </AppBody>

      {pair ? (
        <AutoColumn style={{ minWidth: '20rem', marginTop: '1rem' }}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
        </AutoColumn>
      ) : null}
    </>
  )
}
