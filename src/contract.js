const { ethers } = require('ethers')
const {
  bondContract,
  sCLAMContract,
  sClamStakingContract,
  circulatingSupplyContract,
  uniswapPairContract,
} = require('./abi')

const {
  RESERVE_MAI_CLAM,
  RESERVE_FRAX_CLAM,
  BOND_MAI44,
  BOND_FRAX44,
  BOND_MAI_CLAM44,
  BOND_FRAX_CLAM44,
  BOND_MATIC44,
  STAKING_ADDRESS,
  sCLAM_ADDRESS,
  CLAM_CIRCULATING_SUPPLY,
} = require('./constant')

const provider = new ethers.providers.JsonRpcProvider(
  'https://polygon-rpc.com/',
)

const bondContract_MAI44 = bondContract(BOND_MAI44, provider)
const bondContract_FRAX44 = bondContract(BOND_FRAX44, provider)
const bondContract_MAI_CLAM44 = bondContract(BOND_MAI_CLAM44, provider)
const bondContract_FRAX_CLAM44 = bondContract(BOND_FRAX_CLAM44, provider)
const bondContract_MATIC44 = bondContract(BOND_MATIC44, provider, true)

const pairContract_MAI_CLAM = uniswapPairContract(RESERVE_MAI_CLAM, provider)
const pairContract_FRAX_CLAM = uniswapPairContract(RESERVE_FRAX_CLAM, provider)

const stakingContract = sClamStakingContract(STAKING_ADDRESS, provider)
const sCLAM = sCLAMContract(sCLAM_ADDRESS, provider)
const circulatingSupply_CLAM = circulatingSupplyContract(
  CLAM_CIRCULATING_SUPPLY,
  provider,
)

module.exports = {
  provider,
  bondContract_MAI44,
  bondContract_FRAX44,
  bondContract_MAI_CLAM44,
  bondContract_FRAX_CLAM44,
  bondContract_MATIC44,
  pairContract_MAI_CLAM,
  pairContract_FRAX_CLAM,
  stakingContract,
  sCLAM,
  circulatingSupply_CLAM,
}
