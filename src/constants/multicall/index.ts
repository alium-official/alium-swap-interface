import { ChainId } from '@aliumswap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb', // TODO
  [ChainId.BSCTESTNET]: '0x020b5158443287a8C5366e81BC70ecEEdb8d7FC2',
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
