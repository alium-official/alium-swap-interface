import React from 'react'
import styled from 'styled-components'
import { useActivePopups } from '../../state/application/hooks'
import { AutoColumn } from '../Column'
import PopupItem from './PopupItem'

const MobilePopupWrapper = styled.div<{ height: string | number }>`
  position: relative;
  max-width: 100%;
  height: ${({ height }) => height};
  margin: ${({ height }) => (height ? '0 auto;' : 0)};
  margin-bottom: ${({ height }) => (height ? '20px' : 0)}};
  display: none;

  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
  }
`

const MobilePopupInner = styled.div`
  height: 99%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;
  ::-webkit-scrollbar {
    display: none;
  }
`

const FixedPopupColumn = styled(AutoColumn)`
  position: fixed;
  top: 64px;
  right: 1rem;
  max-width: 355px !important;
  width: 100%;
  z-index: 2;

  ${({ theme }) => theme.mediaQueries.sm} {
    display: none;
  }
`

const StyledPopupContainer = styled.div`
  position: fixed;
  right: 0;
  top: 97px;
  z-index: 10000;
  > div:last-child > div{
    display: flex;
    flex-direction: column;
  }
   > div:last-child > div > div:not(:last-child) {
    margin-bottom: 5px;
  }
`

export default function Popups() {
  // get all popups
  const activePopups = useActivePopups()
  // const activePopups =
  // [
  // {
  //   "key": "0xc56bdf1e4b9c5ab81f03fdf3de1d90b326df8918034f6726b2ce340330ee4828",
  //   "show": true,
  //   "content": {
  //     "txn": {
  //       "hash": "0xc56bdf1e4b9c5ab81f03fdf3de1d90b326df8918034f6726b2ce340330ee4828",
  //       "success": true,
  //       "summary": "Swap 0.000000139 BNB for 1 ALM"
  //     }
  //   },
  //   "removeAfterMs": 15000000
  // }
  // ]
  return (
    <StyledPopupContainer>
      <FixedPopupColumn gap="20px">
        {activePopups.map((item) => (
          <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
        ))}
      </FixedPopupColumn>
      <MobilePopupWrapper height={activePopups?.length > 0 ? 'fit-content' : 0}>
        <MobilePopupInner>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
            ))}
        </MobilePopupInner>
      </MobilePopupWrapper>
    </StyledPopupContainer>
  )
}
