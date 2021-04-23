import { ChainId } from '@alium-official/sdk'

import bscTokens from './bsc.json'
import hecoTokens from './heco.json'

const DEFAULT_LIST: { [chainId in ChainId]: any } = {
  [ChainId.MAINNET]: bscTokens,
  [ChainId.BSCTESTNET]: bscTokens,
  [ChainId.HECOMAINNET]: hecoTokens,
  [ChainId.HECOTESTNET]: hecoTokens,
}

export default DEFAULT_LIST
