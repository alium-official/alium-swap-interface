import { ChainId } from '@aliumswap/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { BscConnector } from '@binance-chain/bsc-connector'
import { ConnectorNames } from '@aliumswap/uikit'
// import Web3 from 'web3'
import getNodeUrl from './getRpcUrl'

export const getConnectorsByName = (connectorID: ConnectorNames) => {
  const POLLING_INTERVAL = 12000
  const params = new URLSearchParams(window.location.search)
  const id = params.get('network')
  const chainId: any = id || parseInt(process.env.REACT_APP_CHAIN_ID as string, 10)
  const rpcUrl = getNodeUrl(chainId)
  const currentChainId = localStorage.getItem('chainId')

  localStorage.setItem('chainId', chainId)

  const chainIdList = Object.keys(ChainId).map((key) => ChainId[key])
  const injected = new InjectedConnector({ supportedChainIds: currentChainId === chainId ? chainIdList : [] })

  const walletconnect = new WalletConnectConnector({
    rpc: { [chainId]: rpcUrl as string },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    pollingInterval: POLLING_INTERVAL,
  })

  const bscConnector = new BscConnector({ supportedChainIds: [56, 97] })

  const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.Injected]: injected,
    [ConnectorNames.WalletConnect]: walletconnect,
    [ConnectorNames.BSC]: bscConnector,
  }

  return { chainId, connector: connectorsByName[connectorID] }
}

export const getLibrary = (provider: any) => {
  return provider
}
