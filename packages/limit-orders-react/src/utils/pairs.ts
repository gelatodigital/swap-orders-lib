import { Token } from "@uniswap/sdk-core";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";
import { isEthereumChain } from "@gelatonetwork/limit-orders-lib/dist/utils";

const SPOOKY_SWAP_FACTORY_ADDRESS =
  "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3";
const SPOOKY_SWAP_INIT_CODE_HASH =
  "0xcdf2deca40a0bd56de8e3ce5c7df6727e5b1bf2ac96f283fa9c4b3e6b42ea9d2";

const QUICK_SWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const QUICK_SWAP_INIT_CODE_HASH =
  "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

const SPIRIT_SWAP_FACTORY_ADDRESS =
  "0xEF45d134b73241eDa7703fa787148D9C9F4950b0";
const SPIRIT_SWAP_INIT_CODE_HASH =
  "0xe242e798f6cee26a9cb0bbf24653bf066e5356ffeac160907fe2cc108e238617";

const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UNISWAP_INIT_CODE_HASH =
  "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

const POLYDEX_FACTORY_ADDRESS = "0x5BdD1CD910e3307582F213b33699e676E61deaD9";
const POLYDEX_INIT_CODE_HASH =
  "0x8cb41b27c88f8934c0773207afb757d84c4baa607990ad4a30505e42438d999a";

const CAFESWAP_FACTORY_ADDRESS = "0x5eDe3f4e7203Bf1F12d57aF1810448E5dB20f46C";
const CAFESWAP_INIT_CODE_HASH =
  "0x29fc590aa3fac813c6aed55e47ef28208a9ac3951233b0b657353007c68aca4d";

const PANCAKESWAP_FACTORY_ADDRESS =
  "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
const PANCAKESWAP_INIT_CODE_HASH =
  "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5";

const TRADERJOE_FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";
const TRADERJOE_INIT_CODE_HASH =
  "0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91";

const DEFYSWAP_FACTORY_ADDRESS = "0xAffdbEAE1ec595cba4C262Bdb52A6083aEc2e2a6";
const DEFYSWAP_INIT_CODE_HASH =
  "0x28612bce471572b813dde946a942d1fee6ca4be6437ac8c23a7ca01a3b127ba6";

const PANGOLIN_FACTORY_ADDRESS = "0xefa94DE7a4656D787667C749f7E1223D71E9FD88";
const PANGOLIN_INIT_CODE_HASH =
  "0x40231f6b438bce0797c9ada29b718a87ea0a5cea3fe9a771abdd76bd41a3e545";

const TOMB_FACTORY_ADDRESS = "0xe236f6890f1824fa0a7ffc39b1597a5a6077cfe9";
const TOMB_INIT_CODE_HASH =
  "0x2dfbcf1b907f911bc66d083d103a1d7de0b8b21a6cb2a66a78d1f1559018fba4";

const VVS_FACTORY_ADDRESS = "0x3b44b2a187a7b3824131f8db5a74194d0a42fc15";
const VVS_INIT_CODE_HASH =  "0xa77ee1cc0f39570ddde947459e293d7ebc2c30ff4e8fc45860afdcb2c2d3dc17";

const getSpiritSwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    SPIRIT_SWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    SPIRIT_SWAP_INIT_CODE_HASH
  );
};

const getQuickSwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    QUICK_SWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    QUICK_SWAP_INIT_CODE_HASH
  );
};

const getSpookySwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    SPOOKY_SWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    SPOOKY_SWAP_INIT_CODE_HASH
  );
};

const getUniswapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    UNISWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    UNISWAP_INIT_CODE_HASH
  );
};

const getPolydexPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    POLYDEX_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    POLYDEX_INIT_CODE_HASH
  );
};

const getCafeSwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    CAFESWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    CAFESWAP_INIT_CODE_HASH
  );
};

const getPancakeSwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    PANCAKESWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    PANCAKESWAP_INIT_CODE_HASH
  );
};

const getTraderJoePairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    TRADERJOE_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    TRADERJOE_INIT_CODE_HASH
  );
};

const getDefySwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    DEFYSWAP_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    DEFYSWAP_INIT_CODE_HASH
  );
};

const getPangolinPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    PANGOLIN_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    PANGOLIN_INIT_CODE_HASH
  );
};

const getTombSwapPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    TOMB_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    TOMB_INIT_CODE_HASH
  );
};

const getVVSPairAddress = (tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks

  return getCreate2Address(
    VVS_FACTORY_ADDRESS,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [tokens[0].address, tokens[1].address])]
    ),
    VVS_INIT_CODE_HASH
  );
};

export const calculatePairAddressByHandler = (
  tokenA: Token,
  tokenB: Token,
  handler?: string
): string | undefined => {
  if (tokenA.chainId === 137 && tokenB.chainId === 137) {
    switch (handler) {
      case "polydex":
        return getPolydexPairAddress(tokenA, tokenB);
      case "quickswap":
        return getQuickSwapPairAddress(tokenA, tokenB);
      case "cafeswap":
        return getCafeSwapPairAddress(tokenA, tokenB);
      default:
        return getQuickSwapPairAddress(tokenA, tokenB);
    }
  } else if (tokenA.chainId === 250 && tokenB.chainId === 250) {
    switch (handler) {
      case "spiritswap":
        return getSpiritSwapPairAddress(tokenA, tokenB);
      case "spookyswap":
        return getSpookySwapPairAddress(tokenA, tokenB);
      case "defyswap":
        return getDefySwapPairAddress(tokenA, tokenB);
      case "tombswap":
        return getTombSwapPairAddress(tokenA, tokenB);
      default:
        return getSpookySwapPairAddress(tokenA, tokenB);
    }
  } else if (tokenA.chainId === 56 && tokenB.chainId === 56) {
    switch (handler) {
      case "pancakeswap":
        return getPancakeSwapPairAddress(tokenA, tokenB);
      default:
        return getPancakeSwapPairAddress(tokenA, tokenB);
    }
  } 
  else if (tokenA.chainId === 25 && tokenB.chainId === 25) {
    switch (handler) {
      case "vvsfinance":
        return getVVSPairAddress(tokenA, tokenB);
      default:
        return getVVSPairAddress(tokenA, tokenB);
    }
  } else if (tokenA.chainId === 43114 && tokenB.chainId === 43114) {
    switch (handler) {
      case "traderjoe":
        return getTraderJoePairAddress(tokenA, tokenB);
      case "pangolin":
        return getPangolinPairAddress(tokenA, tokenB);
      default:
        return getTraderJoePairAddress(tokenA, tokenB);
    }
  } else if (isEthereumChain(tokenA.chainId)) {
    return getUniswapPairAddress(tokenA, tokenB);
  } else return undefined;
};
