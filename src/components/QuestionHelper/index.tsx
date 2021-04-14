import React, { useCallback, useState } from 'react'
import { HelpIcon } from '@aliumswap/uikit'
import styled from 'styled-components'
import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div<{ bordered?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  color: ${({ theme }) => theme.colors.textSubtle};

  ${({ bordered }) =>
    bordered &&
    `
    border: 1px solid #D2D6E5;
    box-sizing: border-box;
    border-radius: 6px;
    width: 40px;
    height: 40px;
  `}

  :hover,
  :focus {
    opacity: 0.7;
  }
`

export default function QuestionHelper({ text, bordered }: { text: string; bordered?: boolean }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} bordered={bordered}>
          <HelpIcon />
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}
