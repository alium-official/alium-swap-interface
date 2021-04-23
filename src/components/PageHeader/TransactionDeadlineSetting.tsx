import React, { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Input, Text } from '@alium-official/uikit'
import { useTranslation } from 'react-i18next'
import { useUserDeadline } from 'state/user/hooks'
import QuestionHelper from '../QuestionHelper'

const StyledTransactionDeadlineSetting = styled.div`
  margin-bottom: 16px;
  margin-top: 20px;

  @media screen and (max-width: 480px) {
    margin-top: 10px;
  }
`

const Label = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 14px;

  > div {
    letter-spacing: -0.1px;
  }

  @media screen and (max-width: 480px) {
    margin-bottom: 8px;
  }
`

const Field = styled.div`
  display: flex;
  align-items: center;
  & > ${Input} {
    width: 100%;
    max-width: 301.7px;
    height: 48px;
  }

  & > ${Text} {
    min-width: 52px;
    font-size: 14px;
    margin-left: 16px;
  }
`

const TransactionDeadlineSetting = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [deadline, setDeadline] = useUserDeadline()
  const [value, setValue] = useState(deadline / 60) // deadline in minutes
  const [error, setError] = useState<string | null>(null)

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = evt.target
    setValue(parseInt(inputValue, 10))
  }

  // Updates local storage if value is valid
  useEffect(() => {
    try {
      const rawValue = value * 60
      if (!Number.isNaN(rawValue) && rawValue > 0) {
        setDeadline(rawValue)
        setError(null)
      } else {
        setError(t('errorMessages.validDeadline'))
      }
    } catch {
      setError(t('errorMessages.validDeadline'))
    }
  }, [t, value, setError, setDeadline])

  return (
    <StyledTransactionDeadlineSetting>
      <Label>
        <Text style={{ fontWeight: 600 }}>{t('transactionDeadline')}</Text>
        <QuestionHelper text={t('questionHelperMessages.transactionRevertPending')} />
      </Label>
      <Field>
        <Input type="number" step="1" min="1" value={value} onChange={handleChange} />
        <Text color={theme.colors.textSubtle}>{t('minutes')}</Text>
      </Field>
      {error && (
        <Text mt="8px" color="failure">
          {error}
        </Text>
      )}
    </StyledTransactionDeadlineSetting>
  )
}

export default TransactionDeadlineSetting
