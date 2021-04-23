import { ChainId } from '@alium-official/sdk'
import { nodes } from './getRpcUrl'

const Params = {
  [ChainId.MAINNET]: [
    {
      chainId: `0x${ChainId.MAINNET.toString(16)}`,
      chainName: 'Binance Smart Chain Mainnet',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'bnb',
        decimals: 18,
      },
      rpcUrls: nodes[ChainId.MAINNET],
      blockExplorerUrls: ['https://bscscan.com/'],
    },
  ],
  [ChainId.BSCTESTNET]: [
    {
      chainId: `0x${ChainId.BSCTESTNET.toString(16)}`,
      chainName: 'Binance Smart Chain Testnet',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'bnb',
        decimals: 18,
      },
      rpcUrls: nodes[ChainId.BSCTESTNET],
      blockExplorerUrls: ['https://testnet.bscscan.com/'],
    },
  ],
  [ChainId.HECOMAINNET]: [
    {
      chainId: `0x${ChainId.HECOMAINNET.toString(16)}`,
      chainName: 'Heco Chain Mainnet',
      nativeCurrency: {
        name: 'HT',
        symbol: 'ht',
        decimals: 18,
      },
      rpcUrls: nodes[ChainId.HECOMAINNET],
      blockExplorerUrls: ['https://hecoinfo.com/'],
    },
  ],
  [ChainId.HECOTESTNET]: [
    {
      chainId: `0x${ChainId.HECOTESTNET.toString(16)}`,
      chainName: 'Heco Chain Testnet',
      nativeCurrency: {
        name: 'HT',
        symbol: 'ht',
        decimals: 18,
      },
      rpcUrls: nodes[ChainId.HECOTESTNET],
      blockExplorerUrls: ['https://testnet.hecoinfo.com/'],
    },
  ],
}

/**
 * Prompt the user to add BSC as a network on Metamask, or switch to BSC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const setupNetwork = async (chainId: ChainId) => {
  const provider: any = (window as WindowChain).ethereum
  if (provider) {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: Params[chainId],
      })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error("Can't setup the network on metamask because window.ethereum is undefined")
    return false
  }
}

/**
 * Prompt the user to add a custom token to metamask
 * @param tokenAddress
 * @param tokenSymbol
 * @param tokenDecimals
 * @param tokenImage
 * @returns {boolean} true if the token has been added, false otherwise
 */
export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage: string
) => {
  const provider: any = (window as WindowChain).ethereum
  let tokenAdded: any
  if (provider) {
    tokenAdded = await provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    })
  }

  return tokenAdded
}
