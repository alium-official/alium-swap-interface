import { Currency } from '@alium-official/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && `${(sizeraw / 3 + 8).toString()}px`};

  > *:last-child {
    position: absolute;
    left: 15px;
    z-index: 2;
    border-radius: 16px;
    box-shadow: 0px 6px 12px rgba(185, 189, 208, 0.4);
  }

  > *:first-child {
    box-shadow: 0px 6px 12px rgba(185, 189, 208, 0.4);
    z-index: 4;
  }
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  position: absolute;
  left: -20px;
`

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false,
}: DoubleCurrencyLogoProps) {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo currency={currency0} size={`${size.toString()}px`} />}
      {currency1 && <CoveredLogo currency={currency1} size={`${size.toString()}px`} sizeraw={size} />}
    </Wrapper>
  )
}
