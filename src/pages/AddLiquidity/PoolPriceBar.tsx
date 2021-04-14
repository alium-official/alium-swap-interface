import React from 'react'
import { Currency, Percent, Price } from '@aliumswap/sdk'
import { Text } from '@aliumswap/uikit'
import styled from 'styled-components'
import { ONE_BIPS } from 'config/settings'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { Field } from '../../state/mint/actions'
// import { TYPE } from '../../components/Shared'

// const { black: Black } = TYPE

const StyledPoolPriceBar = styled.div`
  @media screen and (max-width: 600px) {
    > div > div {
      flex-direction: column;
    }

    > div > div > div:not(:last-child) {
      margin-bottom: 6px !important;
    }
  }
`

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price,
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  return (
    <StyledPoolPriceBar>
      <AutoColumn gap="md">
        <AutoRow justify="space-around" gap="4px">
          <AutoColumn justify="center">
            <Text color="#6c5dd3" fontSize="14px" style={{ fontWeight: 500 }}>
              {price?.toSignificant(6) ?? '—'}
            </Text>
            <Text fontSize="14px" color="#8990a5" pt={1}>
              {currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
            </Text>
          </AutoColumn>
          <AutoColumn justify="center">
            <Text color="#6c5dd3" fontSize="14px" style={{ fontWeight: 500 }}>
              {price?.invert()?.toSignificant(6) ?? '—'}
            </Text>
            <Text fontSize="14px" color="#8990a5" pt={1}>
              {currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
            </Text>
          </AutoColumn>
          <AutoColumn justify="center">
            <Text color="#6c5dd3" fontSize="14px" style={{ fontWeight: 500 }}>
              {noLiquidity && price
                ? '100'
                : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
              %
            </Text>
            <Text fontSize="14px" color="#8990a5" pt={1}>
              Share of Pool
            </Text>
          </AutoColumn>
        </AutoRow>
      </AutoColumn>
    </StyledPoolPriceBar>
  )
}

export default PoolPriceBar
