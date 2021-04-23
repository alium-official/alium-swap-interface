import React, { useContext } from 'react'
import { PopupCheckIcon, PopupFailIcon } from '@alium-official/uikit'
import styled, { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { TYPE, ExternalLink } from '../Shared'
import { getExplorerLink, getExplorerName } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const { body: Body } = TYPE

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveWeb3React()

  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? (
          <PopupCheckIcon color={theme.colors.success} width="40px" height="40px" />
        ) : (
          <PopupFailIcon color={theme.colors.failure} width="40px" height="40px" />
        )}
      </div>
      <AutoColumn gap="8px">
        <Body fontWeight={500} style={{ fontWeight: 500 }}>
          {summary ?? `Hash: ${hash.slice(0, 8)}...${hash.slice(58, 65)}`}
        </Body>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, hash, 'transaction')}>
            View on {getExplorerName(chainId)}
          </ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
