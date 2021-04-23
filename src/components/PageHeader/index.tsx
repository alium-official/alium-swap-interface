import React, { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'
import { Heading, IconButton, Text, Flex, useModal } from '@alium-official/uikit'
import { useTranslation } from 'react-i18next'
import SettingsModal from './SettingsModal'
import RecentTransactionsModal from './RecentTransactionsModal'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

// TODO: use UI Kit
const CogIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      opacity="0.5"
      d="M15.25 12C15.25 13.7949 13.7949 15.25 12 15.25C10.2051 15.25 8.75 13.7949 8.75 12C8.75 10.2051 10.2051 8.75 12 8.75C13.7949 8.75 15.25 10.2051 15.25 12Z"
      stroke="#8990A5"
      strokeWidth="1.5"
    />
    <path
      d="M4.62272 7.15465C4.50647 6.97641 4.53097 6.7411 4.68144 6.59063L6.59063 4.68144C6.7411 4.53097 6.97641 4.50647 7.15465 4.62272L8.14511 5.26867C8.47132 5.48141 8.88414 5.49566 9.24388 5.34648V5.34648C9.60345 5.19738 9.88588 4.8952 9.96607 4.51429L10.2097 3.3573C10.2535 3.14906 10.4372 3 10.65 3H13.35C13.5628 3 13.7465 3.14906 13.7903 3.3573L14.0339 4.51429C14.1141 4.8952 14.3965 5.19738 14.7561 5.34648V5.34648C15.1159 5.49566 15.5287 5.48141 15.8549 5.26867L16.8453 4.62272C17.0236 4.50647 17.2589 4.53097 17.4094 4.68144L19.3186 6.59063C19.469 6.7411 19.4935 6.97641 19.3773 7.15465L18.7313 8.14511C18.5186 8.47132 18.5043 8.88414 18.6535 9.24388V9.24388C18.8026 9.60345 19.1048 9.88588 19.4857 9.96607L20.6427 10.2097C20.8509 10.2535 21 10.4372 21 10.65V13.35C21 13.5628 20.8509 13.7465 20.6427 13.7903L19.4857 14.0339C19.1048 14.1141 18.8026 14.3965 18.6535 14.7561V14.7561C18.5043 15.1159 18.5186 15.5287 18.7313 15.8549L19.3773 16.8453C19.4935 17.0236 19.469 17.2589 19.3186 17.4094L17.4094 19.3186C17.2589 19.469 17.0236 19.4935 16.8453 19.3773L15.8549 18.7313C15.5287 18.5186 15.1159 18.5043 14.7561 18.6535V18.6535C14.3965 18.8026 14.1141 19.1048 14.0339 19.4857L13.7903 20.6427C13.7465 20.8509 13.5628 21 13.35 21H10.65C10.4372 21 10.2535 20.8509 10.2097 20.6427L9.96607 19.4857C9.88588 19.1048 9.60345 18.8026 9.24388 18.6535V18.6535C8.88414 18.5043 8.47132 18.5186 8.14511 18.7313L7.15465 19.3773C6.97641 19.4935 6.7411 19.469 6.59063 19.3186L4.68144 17.4094C4.53097 17.2589 4.50647 17.0236 4.62272 16.8453L5.26867 15.8549C5.48141 15.5287 5.49566 15.1159 5.34648 14.7561V14.7561C5.19738 14.3965 4.8952 14.1141 4.51429 14.0339L3.3573 13.7903C3.14906 13.7465 3 13.5628 3 13.35L3 10.65C3 10.4372 3.14906 10.2535 3.3573 10.2097L4.51429 9.96607C4.8952 9.88588 5.19738 9.60345 5.34648 9.24388V9.24388C5.49566 8.88414 5.48141 8.47132 5.26867 8.14511L4.62272 7.15465Z"
      stroke="#8990A5"
      strokeWidth="1.5"
    />
  </svg>
)

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5V9C3 9.55228 3.44772 10 4 10H8" stroke="#8990A5" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M5.96556 14.4064C5.82638 14.0162 5.39729 13.8128 5.00716 13.952C4.61703 14.0911 4.41359 14.5202 4.55276 14.9104L5.96556 14.4064ZM7.1763 6.33837L7.68646 6.88813L7.69477 6.88041L7.70285 6.87245L7.1763 6.33837ZM4.55276 14.9104C5.19159 16.7011 6.40172 18.2364 7.99889 19.2863L8.82285 18.0329C7.49605 17.1607 6.49393 15.8874 5.96556 14.4064L4.55276 14.9104ZM7.99889 19.2863C9.59592 20.3361 11.4941 20.8443 13.4074 20.7356L13.3223 19.238C11.729 19.3286 10.1498 18.9052 8.82285 18.0329L7.99889 19.2863ZM13.4074 20.7356C15.3208 20.6268 17.1478 19.9069 18.6129 18.6825L17.6511 17.5315C16.4348 18.5479 14.9156 19.1474 13.3223 19.238L13.4074 20.7356ZM18.6129 18.6825C20.0781 17.4581 21.1022 15.7952 21.5289 13.9435L20.0672 13.6067C19.7145 15.1375 18.8672 16.5152 17.6511 17.5315L18.6129 18.6825ZM21.5289 13.9435C21.9556 12.0918 21.7612 10.1533 20.9756 8.42074L19.6095 9.04018C20.2595 10.4736 20.4199 12.0761 20.0672 13.6067L21.5289 13.9435ZM20.9756 8.42074C20.1901 6.68833 18.8566 5.25682 17.1779 4.34032L16.4591 5.65689C17.8545 6.41867 18.9595 7.60663 19.6095 9.04018L20.9756 8.42074ZM17.1779 4.34032C15.4993 3.42391 13.5656 3.07145 11.6676 3.33517L11.874 4.8209C13.4544 4.60132 15.0637 4.89504 16.4591 5.65689L17.1779 4.34032ZM11.6676 3.33517C9.76961 3.59889 8.00835 4.46482 6.64974 5.80429L7.70285 6.87245C8.83006 5.76112 10.2938 5.04047 11.874 4.8209L11.6676 3.33517ZM6.66613 5.78862L2.48983 9.66417L3.51017 10.7637L7.68646 6.88813L6.66613 5.78862Z"
      fill="#8990A5"
    />
  </svg>
)

const StyledIcon = styled.div<{ margin?: number }>`
  border: 1px solid #d2d6e5;
  box-sizing: border-box;
  border-radius: 6px;
  margin-right: ${(props) => (props.margin ? props.margin : 0)}px;
  > button {
    width: 40px;
    height: 40px;
  }
`

const StyledPageHeader = styled.div`
  border-bottom: 1px solid #f4f5fa;
  padding: 26px 24px 26px 24px;

  > div h2 {
    font-size: 18px;
  }

  @media screen and (max-width: 376px) {
    padding: 20px 16px;
  }
`

const Details = styled.div`
  flex: 1;
`

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  const theme = useTheme() as any
  const { t } = useTranslation()

  const [onPresentSettings] = useModal(<SettingsModal />)
  const [onPresentRecentTransactions] = useModal(<RecentTransactionsModal />)

  return (
    <StyledPageHeader>
      <Flex alignItems="center">
        <Details>
          <Heading mb="8px">{title}</Heading>
          {description && (
            <Text color={theme.colors.basic} fontSize="14px">
              {description}
            </Text>
          )}
        </Details>
        <StyledIcon margin={6} title={t('settings')}>
          <IconButton variant="text" onClick={onPresentSettings}>
            <CogIcon />
          </IconButton>
        </StyledIcon>
        <StyledIcon title={t('recentTransactions')}>
          <IconButton variant="text" onClick={onPresentRecentTransactions}>
            <HistoryIcon />
          </IconButton>
        </StyledIcon>
      </Flex>
      {children && <Text mt="16px">{children}</Text>}
    </StyledPageHeader>
  )
}

export default PageHeader
