import { Currency, CurrencyAmount, Fraction, Percent } from '@aliumswap/sdk'
import React from 'react'
import { Button } from '@aliumswap/uikit-beta'

import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../components/Shared'

const { body: Body } = TYPE

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  return (
    <>
      <RowBetween>
        <Body style={{color: '#8990A5', padding: '8px', fontSize: '11px'}}>{currencies[Field.CURRENCY_A]?.symbol} Deposited</Body>
        <RowFixed style={{padding: '8px'}}>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <Body style={{fontWeight: '500', fontSize: '11px'}}>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Body>
        </RowFixed>
      </RowBetween>
      <RowBetween style={{backgroundColor: '#F4F5FA', borderRadius: '6px', padding: '8px'}}>
        <Body style={{color: '#8990A5', fontSize: '11px'}}>{currencies[Field.CURRENCY_B]?.symbol} Deposited</Body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <Body style={{fontWeight: '500', fontSize: '11px'}}>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Body>
        </RowFixed>
      </RowBetween>
      <RowBetween style={{paddingRight: '8px'}}>
        <Body style={{color: '#8990A5', padding: '0 8px', fontSize: '11px'}}>Rates</Body>
        <Body style={{fontWeight: '500', fontSize: '11px'}}>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </Body>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
        <Body style={{fontWeight: '500', fontSize: '11px'}}>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </Body>
      </RowBetween>
      <RowBetween style={{backgroundColor: '#F4F5FA', borderRadius: '6px', padding: '8px'}}>
        <Body style={{color: '#8990A5', fontSize: '11px'}}>Share of Pool:</Body>
        <Body style={{fontWeight: '500', fontSize: '11px'}}>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</Body>
      </RowBetween>
      <Button mt="10px" mb="20px" onClick={onAdd} fullWidth>
        {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
      </Button>
    </>
  )
}

export default ConfirmAddModalBottom
