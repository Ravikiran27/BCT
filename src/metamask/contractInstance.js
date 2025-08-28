import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../rolesConfig";
import SupplyChainABI from "../artifacts/contracts/SupplyChain.sol/SupplyChain.json";

export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI.abi, signerOrProvider);
}
