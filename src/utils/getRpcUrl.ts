import { ChainId } from '@aliumswap/sdk'
import random from 'lodash/random'

const bscNodes = [process.env.REACT_APP_NODE_1, process.env.REACT_APP_NODE_2, process.env.REACT_APP_NODE_3]
const hecoNodes = [process.env.REACT_APP_HECO_NODE_1]

// Array of available nodes to connect to
export const nodes = {
  [ChainId.MAINNET]: bscNodes,
  [ChainId.BSCTESTNET]: bscNodes,
  [ChainId.HECOMAINNET]: hecoNodes,
  [ChainId.HECOTESTNET]: hecoNodes,
}

const getNodeUrl = (chainId: ChainId) => {
  const randomIndex = random(0, nodes[chainId].length - 1)
  return nodes[chainId][randomIndex]
}

export default getNodeUrl
