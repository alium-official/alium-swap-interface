import React from 'react'
// @ts-ignore
import { Text, AscendingIcon } from '@aliumswap/uikit'

import styled from 'styled-components'
import { RowFixed } from '../Row'

export const FilterWrapper = styled(RowFixed)`
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.invertedContrast};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  user-select: none;
  & > * {
    user-select: none;
  }
  :hover {
    cursor: pointer;
  }
`

interface StyledAscendingButtonProps {
  reversed?: boolean
}

const StyledAscendingButton = styled.div`
  line-height: 0;
  transition: transform 200ms ease-in-out;
  ${(props: StyledAscendingButtonProps) => props.reversed && 'transform: rotate(180deg)'}
`

export default function SortButton({
  toggleSortOrder,
  ascending,
}: {
  toggleSortOrder: () => void
  ascending: boolean
}) {
  return (
    <FilterWrapper onClick={toggleSortOrder}>
      <Text fontSize="14px">
        {ascending ? (
          <StyledAscendingButton reversed>
            <AscendingIcon />
          </StyledAscendingButton>
        ) : (
          <StyledAscendingButton>
            <AscendingIcon />
          </StyledAscendingButton>
        )}
      </Text>
    </FilterWrapper>
  )
}
