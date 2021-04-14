import { Currency, ETHER, Token, ChainId } from '@aliumswap/sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import BNBLogo from '../../assets/images/binance-logo.png'
import HTlogo from '../../assets/images/heco-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import CoinLogo from '../alium/CoinLogo'

const BaseLogo: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: BNBLogo,
  [ChainId.BSCTESTNET]: BNBLogo,
  [ChainId.HECOMAINNET]: HTlogo,
  [ChainId.HECOTESTNET]: HTlogo,
}

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${address}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React()
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, `/images/coins/${currency?.symbol ?? 'token'}.png`, getTokenLogoURL(currency.address)]
      }

      return [`/images/coins/${currency?.symbol ?? 'token'}.png`, getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  if (currency === ETHER) {
    return <StyledEthereumLogo src={chainId && BaseLogo[chainId]} size={size} style={style} />
  }

  return (currency as any)?.symbol ? (
    <CoinLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
  ) : (
    // <FilledHelp height="24px" width="24px" mr="8px" />
    <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
  )
}
