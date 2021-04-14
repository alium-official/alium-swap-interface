import { Trade } from '@aliumswap/sdk'
import React, { Fragment, memo } from 'react'
import { ChevronRight } from 'react-feather'
import { Flex } from '@aliumswap/uikit'

import styled from 'styled-components'
import { TYPE } from '../Shared'
import CurrencyLogo from '../CurrencyLogo'

const { black: Black } = TYPE

const StyledFlex = styled(Flex)`
  > img {
    border-radius: 16px;
    box-shadow: 0px 6px 12px rgba(185, 189, 208, 0.4);
  }
  > svg {
    border-radius: 16px;
    box-shadow: 0px 6px 12px rgba(185, 189, 208, 0.4);
  }
`

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  return (
    <Flex
      px="1rem"
      py="0.5rem"
      my="0.5rem"
      style={{ border: `1px solid #F5F7FF`, borderRadius: '6px' }}
      flexWrap="wrap"
      justifyContent="space-evenly"
      alignItems="center"
    >
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <StyledFlex my="0.5rem" alignItems="center" style={{ flexShrink: 0 }}>
              <CurrencyLogo currency={token} />
              <Black fontSize={14} color="#8990A5" ml="0.5rem">
                {token.symbol}
              </Black>
            </StyledFlex>
            {isLastItem ? null : <ChevronRight color="#8990A5" />}
          </Fragment>
        )
      })}
    </Flex>
  )
})
