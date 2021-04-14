import { Interface } from '@ethersproject/abi'
import { IPAIR_ABI } from '../abis'

const PAIR_INTERFACE = new Interface(IPAIR_ABI)

export default PAIR_INTERFACE
