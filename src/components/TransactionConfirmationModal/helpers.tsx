import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Heading, IconButton, CloseIcon } from '@aliumswap/uikit'

import { AutoColumn, ColumnCenter } from '../Column'

export const Wrapper = styled.div`
  width: 100%;
  overflow-y: hidden;
  max-height: 100vh;
`
export const Section = styled(AutoColumn)`
  padding: 24px;
`

export const ConfirmedIcon = styled(ColumnCenter)`
  padding: 40px 0;
`

export const BottomSection = styled(Section)`
  background-color: ${({ theme }) => theme.colors.invertedContrast};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

/**
 * TODO: Remove this when modal system from the UI Kit is implemented
 */
const StyledContentHeader = styled.div`
  align-items: center;
  display: flex;
  padding: 24px;
  height: 72px;
  border-bottom: 1px solid #f4f5fa;

  & > ${Heading} {
    flex: 1;
    font-size: 18px;
    letter-spacing: -0.3px;
    font-weight: 500;
  }
`

const StyledIcon = styled.div<{ margin?: number }>`
  border: 1px solid #d2d6e5;
  box-sizing: border-box;
  border-radius: 6px;
  button {
    width: 40px;
    height: 40px;
  }
`

type ContentHeaderProps = {
  children: ReactNode
  onDismiss: () => void
}

export const ContentHeader = ({ children, onDismiss }: ContentHeaderProps) => (
  <StyledContentHeader>
    <Heading>{children}</Heading>
    <StyledIcon>
      <IconButton onClick={onDismiss} variant="text">
        <CloseIcon color="primary" />
      </IconButton>
    </StyledIcon>
  </StyledContentHeader>
)
