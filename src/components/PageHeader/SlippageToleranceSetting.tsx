import React, { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { ButtonMenu, ButtonMenuItem, Flex, Input, Text } from '@alium-official/uikit'
import { useTranslation } from 'react-i18next'
import { useUserSlippageTolerance } from 'state/user/hooks'
import QuestionHelper from '../QuestionHelper'

const MAX_SLIPPAGE = 5000
const RISKY_SLIPPAGE_LOW = 50
const RISKY_SLIPPAGE_HIGH = 500

const StyledSlippageToleranceSettings = styled.div`
  margin-bottom: 16px;
`

const Field = styled.div`
  display: flex;
  align-items: center;

  & > ${Input} {
    max-width: 325.7px;
    width: 100%;
  }

  & > ${Text} {
    width: 52px;
    font-size: 14px;
    margin-left: 18px;

`

const Options = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;

  & > div {
    width: 100%;
    height: 48px;
    &:first-child {
      padding-top: 8px;
      padding-bottom: 8px;
      flex-basis: 90%;
      margin-right: 8px;
    }
  }

  @media screen and (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const StyledButtonMenu = styled(ButtonMenu)`
  padding-top: 8px;
  padding-bottom: 8px;
`

const StyledButtonItem = styled(ButtonMenuItem)`
  padding: 6px 20px;
  width: 100%;
`

const Label = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 12px;
  > div {
    letter-spacing: -0.1px;
  }
  @media screen and (max-width: 480px) {
    margin-bottom: 8px;
  }
`

const PercentInputWrapper = styled.div`
  margin-left: 10px;

  @media screen and (max-width: 480px) {
    margin-left: 0;
    margin-top: 18px;
  }
`

const predefinedValues = [
  { label: '0,1%', value: 0.1 },
  { label: '0,5%', value: 0.5 },
  { label: '1%', value: 1 },
]

const SlippageToleranceSettings = () => {
  const theme = useTheme()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [value, setValue] = useState(userSlippageTolerance / 100)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = evt.target
    setValue(parseFloat(inputValue))
  }

  const { t } = useTranslation()

  // Updates local storage if value is valid
  useEffect(() => {
    try {
      const rawValue = value * 100
      if (!Number.isNaN(rawValue) && rawValue > 0 && rawValue < MAX_SLIPPAGE) {
        setUserslippageTolerance(rawValue)
        setError(null)
      } else {
        setError('Enter a valid slippage percentage')
      }
    } catch {
      setError('Enter a valid slippage percentage')
    }
  }, [value, setError, setUserslippageTolerance])

  // Notify user if slippage is risky
  useEffect(() => {
    if (userSlippageTolerance < RISKY_SLIPPAGE_LOW) {
      setError('Your transaction may fail')
    } else if (userSlippageTolerance > RISKY_SLIPPAGE_HIGH) {
      setError('Your transaction may be frontrun')
    }
  }, [userSlippageTolerance, setError])

  const getActiveIndex = () => {
    const values = predefinedValues.map((_value) => _value.value)
    return values.indexOf(value)
  }

  const activeIndex = getActiveIndex()

  return (
    <StyledSlippageToleranceSettings>
      <Label>
        <Text style={{ fontWeight: 600 }}>{t('slippedTolerance')}</Text>
        <QuestionHelper text={t('questionHelperMessages.transactionRevert')} />
      </Label>

      <Options>
        <StyledButtonMenu
          size="sm"
          variant="primary"
          activeIndex={activeIndex}
          onClick={(index) => {
            setValue(predefinedValues[index].value)
          }}
        >
          {predefinedValues.map((valueElement) => (
            <StyledButtonItem key={valueElement.value} variant={value === valueElement.value ? 'primary' : 'tertiary'}>
              {valueElement.label}
            </StyledButtonItem>
          ))}
        </StyledButtonMenu>
        <PercentInputWrapper>
          <Flex alignItems="center">
            <Field style={{ width: '100%' }}>
              <Input
                type="number"
                scale="lg"
                step={0.1}
                min={0.1}
                placeholder="5%"
                value={value}
                onChange={handleChange}
                isWarning={error !== null}
              />
              <Text color={theme.colors.textSubtle} fontSize="18px" style={{ width: 'auto' }}>
                %
              </Text>
            </Field>
          </Flex>
        </PercentInputWrapper>
      </Options>
      {error && (
        <Text mt="8px" color="failure">
          {error}
        </Text>
      )}
    </StyledSlippageToleranceSettings>
  )
}

export default SlippageToleranceSettings
