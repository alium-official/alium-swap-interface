import { Interface } from '@ethersproject/abi'
import ERC20_ABI from '../abis/erc20.json'
import ERC20_BYTES32_ABI from '../abis/erc20_bytes32.json'

const ERC20_INTERFACE = new Interface(ERC20_ABI)

const ERC20_BYTES32_INTERFACE = new Interface(ERC20_BYTES32_ABI)

export { ERC20_INTERFACE, ERC20_BYTES32_INTERFACE }
