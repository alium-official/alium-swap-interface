import { ChainId } from '@alium-official/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { BscConnector } from '@binance-chain/bsc-connector'
import { ConnectorNames, getChainId } from '@alium-official/uikit'
// import Web3 from 'web3'
import getNodeUrl from './getRpcUrl'

export const getConnectorsByName = (connectorID: ConnectorNames) => {
  const POLLING_INTERVAL = 12000
  const chainId = getChainId()
  const rpcUrl = getNodeUrl(chainId)

  const chainIdList = Object.keys(ChainId).map((key) => ChainId[key])
  const injected = new InjectedConnector({ supportedChainIds: chainIdList })

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
