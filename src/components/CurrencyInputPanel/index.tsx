import React, { useState, useCallback } from 'react'
import { Currency, Pair } from '@aliumswap/sdk'
import { Button, Text, ArrowDropDownIcon } from '@aliumswap/uikit'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'
import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { Input as NumericalInput } from '../NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import { TranslateString } from '../../utils/translateTextHelpers'

const InputRow = styled.div<{ selected: boolean, customHeight?: number }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.4rem 0.5rem 0.4rem 1rem' : '0.4rem 0.75rem 0.4rem 1rem')};
  ${({customHeight})=>customHeight ? `height: ${customHeight}px;` : ''}
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 34px;
  font-size: 16px;
  font-weight: 500;
  background-color: transparent;
  color: ${({ selected, theme }) => (selected ? theme.colors.text : '#FFFFFF')};
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 8px 0 10px;
  position: relative;
`

const LabelRow = styled.div`
  width: -webkit-fill-available;
  position: absolute;
  padding: 4px 0.75rem;
  top: -17px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  & ${Text} {
    background: #fff;
    padding: 4px;
    font-size: 11px;
    line-height: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.primaryBright};
  }

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.colors.textSubtle)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  border: 1px solid #d2d6e5;
  position: relative;
  border-radius: 6px;
  background-color: transparent;
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: 6px;
  background-color: transparent;
  box-shadow: ${({ theme }) => theme.shadows.inset};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  currencyList?: any
  customHeight?: number
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = TranslateString(132, 'Input'),
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  currencyList,
                                             customHeight
}: CurrencyInputPanelProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween>
              <Text fontSize="14px" style={{ color: '#6C5DD3' }}>
                {label}
              </Text>
              {account && (
                <Text
                  onClick={onMax}
                  fontSize="14px"
                  style={{ display: 'inline', cursor: 'pointer', color: '#6C5DD3' }}
                >
                  {!hideBalance && !!currency && selectedCurrencyBalance
                    ? `Balance: ${selectedCurrencyBalance?.toSignificant(6)}`
                    : ' -'}
                </Text>
              )}
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect} customHeight={customHeight}>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
                style={{ fontSize: '14px' }}
              />
              {account && currency && showMaxButton && label !== 'To' && (
                <Button onClick={onMax} size="sm" variant="text" buttonType="max">
                  MAX
                </Button>
              )}
            </>
          )}
          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin />
              ) : currency ? (
                <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
              ) : null}
              {pair ? (
                <Text color={theme.colors.textSubtle} style={{ marginLeft: '8px', fontSize: '14px' }}>
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </Text>
              ) : (
                <Text color={theme.colors.textSubtle} style={{ paddingRight: '12px', fontSize: '14px' }}>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length
                      )}`
                    : currency?.symbol) || (
                    <Text color={theme.colors.textSubtle} style={{ fontSize: '14px' }}>
                      {t('selectToken')}
                    </Text>
                  )}
                </Text>
              )}
              {!disableCurrencySelect && <ArrowDropDownIcon />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          currencyList={currencyList}
        />
      )}
    </InputPanel>
  )
}
