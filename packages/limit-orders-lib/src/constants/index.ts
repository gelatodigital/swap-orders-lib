export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const SLIPPAGE_BPS = 40; // 0.4%
export const TWO_BPS_GELATO_FEE = 2; // 0.02%

export const CHAIN_ID = {
  MAINNET: 1,
  ROPSTEN: 3,
  GOERLI: 5,
  BSC: 56,
  MATIC: 137,
  FANTOM: 250,
  AVAX: 43114,
};

export const HANDLERS_ADDRESSES = {
  // UniswapV2Router02Handler
  [CHAIN_ID.MAINNET]: {
    ["uniswap"]: "0x837c03414fb86861f28ca7e91e5fd770fda0f52d",
  },
  // UniswapV2Router02Handler
  [CHAIN_ID.ROPSTEN]: {
    ["uniswap"]: "0x1f397f95d31eb20183b69d685a5060cfdefd508b",
  },
  // UniswapV2Router02Handler
  [CHAIN_ID.MATIC]: {
    ["quickswap"]: "0xaccbd2c6ad75ad3394dc5f4b1f606bf111e4eae3",
    ["quickswap_stoploss"]: "0x6EA82C72732389c5149326e048A46Be9F8bec8E8",
    ["polydex"]: "0x00fc86d360162e4672ec6B427E12ed36F39f1f53",
    ["cafeswap"]: "0xd167afcee4e9a89e69646fd3c27e58b61d1b7f97",
  },
  // UniswapV2Router02Handler
  [CHAIN_ID.FANTOM]: {
    ["spiritswap"]: "0x5fb00386558ccc219e51b69d8e963ef20b0c267a",
    ["spookyswap"]: "0x228ffd7122d202c0cd24330892881c47b0817c7a",
    ["bombswap"]: "0x87C4Fbd67f6DD8a1B5EFD9879956c728C97afeFe",
    ["defyswap"]: "0x3d401587320522a5e0bb973d10a852430a8edbbd",
  },
  // UniswapV2Router02Handler
  [CHAIN_ID.BSC]: {
    ["pancakeswap"]: "0x88f8CCC064bA2D39cF08D57B6e7504a7B6bE8E4e",
  },
  // UniswapV2Router02Handler
  [CHAIN_ID.AVAX]: {
    ["traderjoe"]: "0x88f8CCC064bA2D39cF08D57B6e7504a7B6bE8E4e",
    ["pangolin"]: "0x8b206547cfe6f35a77ddab2d6d97260765a349ef",
  },
};

export const NETWORK_NAME = {
  [CHAIN_ID.MAINNET]: "Ethereum",
  [CHAIN_ID.ROPSTEN]: "Ropsten",
  [CHAIN_ID.GOERLI]: "Goerli",
  [CHAIN_ID.MATIC]: "Polygon (Matic)",
  [CHAIN_ID.FANTOM]: "FANTOM",
  [CHAIN_ID.BSC]: "BSC",
  [CHAIN_ID.AVAX]: "AVAX",
};

export const NETWORK_HANDLERS = {
  [CHAIN_ID.MAINNET]: ["uniswap"],
  [CHAIN_ID.ROPSTEN]: ["uniswap"],
  [CHAIN_ID.MATIC]: ["quickswap", "polydex", "cafeswap"],
  [CHAIN_ID.FANTOM]: ["spiritswap", "spookyswap", "bombswap", "defyswap"],
  [CHAIN_ID.BSC]: ["pancakeswap"],
  [CHAIN_ID.AVAX]: ["traderjoe", "pangolin"],
};

export const OLD_SUBGRAPH_URL = {
  [CHAIN_ID.MAINNET]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders",
  [CHAIN_ID.ROPSTEN]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-ropsten",
  [CHAIN_ID.MATIC]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-polygon",
  [CHAIN_ID.FANTOM]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-fantom",
};

export const SUBGRAPH_URL = {
  [CHAIN_ID.MAINNET]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-ii",
  [CHAIN_ID.MATIC]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-polygon-ii",
  [CHAIN_ID.FANTOM]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-fantom-ii",
  [CHAIN_ID.BSC]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-bsc",
  [CHAIN_ID.AVAX]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-avax",
};

export const GELATO_LIMIT_ORDERS_ADDRESS = {
  [CHAIN_ID.MAINNET]: "0x36049D479A97CdE1fC6E2a5D2caE30B666Ebf92B",
  [CHAIN_ID.ROPSTEN]: "0x0e5096D201Fe2985f5C26432A76f145D6e5D1453",
  [CHAIN_ID.GOERLI]: "0xa0453c6ab71fe3da89640ee2503326bd0899a589",
  [CHAIN_ID.MATIC]: "0x38c4092b28dAB7F3d98eE6524549571c283cdfA5",
  [CHAIN_ID.FANTOM]: "0x05Ad1094Eb6Cde564d732196F6754Ee464896031",
  [CHAIN_ID.BSC]: "0x0c30D3d66bc7C73A83fdA929888c34dcb24FD599",
  [CHAIN_ID.AVAX]: "0x0c30D3d66bc7C73A83fdA929888c34dcb24FD599",
};

export const GELATO_LIMIT_ORDERS_MODULE_ADDRESS = {
  [CHAIN_ID.MAINNET]: "0x037fc8e71445910e1E0bBb2a0896d5e9A7485318",
  [CHAIN_ID.ROPSTEN]: "0x3f3C13b09B601fb6074124fF8D779d2964caBf8B",
  [CHAIN_ID.GOERLI]: "0xCf8EDB3333Fae73b23f689229F4De6Ac95d1f707",
  [CHAIN_ID.MATIC]: "0x5A36178E38864F5E724A2DaF5f9cD9bA473f7903",
  [CHAIN_ID.FANTOM]: "0xf2253BF9a0BD002300cFe6f4E630d755669f6DCa",
  [CHAIN_ID.BSC]: "0xb7499a92fc36e9053a4324aFfae59d333635D9c3",
  [CHAIN_ID.AVAX]: "0xb7499a92fc36e9053a4324aFfae59d333635D9c3",
};

export const GELATO_LIMIT_ORDERS_MODULE_FLASHBOTS_ADDRESS = {
  [CHAIN_ID.MAINNET]: "0xbeC333EDE1A0687D2b9624F8C073a54c93ba9777",
  [CHAIN_ID.GOERLI]: "0xCf8EDB3333Fae73b23f689229F4De6Ac95d1f707",
};

export const GELATO_LIMIT_ORDERS_ERC20_ORDER_ROUTER = {
  [CHAIN_ID.MAINNET]: "0x5fb00386558ccc219e51b69d8e963ef20b0c267a",
  [CHAIN_ID.ROPSTEN]: "0x9c06ff386779cc2269d482bcecf2378a4ff5cb90",
  [CHAIN_ID.GOERLI]: "0x247A1306b6122ba28862b19a95004899db91f1b5",
  [CHAIN_ID.MATIC]: "0x0c2c2963a4353ffd839590f7cb1e783688378814",
  [CHAIN_ID.FANTOM]: "0x59e61b95f20e940ac777e88fa2dfa0a6a4c40fa0",
  [CHAIN_ID.BSC]: "0x64c7f3c2C19B41a6aD67bb5f4edc8EdbB3284F34",
  [CHAIN_ID.AVAX]: "0x64c7f3c2C19B41a6aD67bb5f4edc8EdbB3284F34",
};

export const NATIVE_TOKEN_TICKER = {
  [CHAIN_ID.MAINNET]: "ETH",
  [CHAIN_ID.ROPSTEN]: "ETH",
  [CHAIN_ID.GOERLI]: "ETH",
  [CHAIN_ID.MATIC]: "MATIC",
  [CHAIN_ID.FANTOM]: "FTM",
  [CHAIN_ID.BSC]: "BNB",
  [CHAIN_ID.AVAX]: "AVAX",
};

export const NATIVE_WRAPPED_TOKEN_TICKER = {
  [CHAIN_ID.MAINNET]: "WETH",
  [CHAIN_ID.ROPSTEN]: "WETH",
  [CHAIN_ID.GOERLI]: "WETH",
  [CHAIN_ID.MATIC]: "WMATIC",
  [CHAIN_ID.FANTOM]: "WFTM",
  [CHAIN_ID.BSC]: "WBNB",
  [CHAIN_ID.AVAX]: "WAVAX",
};

export const NATIVE_TOKEN_NAME = {
  [CHAIN_ID.MAINNET]: "Ether",
  [CHAIN_ID.ROPSTEN]: "Ether",
  [CHAIN_ID.GOERLI]: "Ether",
  [CHAIN_ID.MATIC]: "Matic",
  [CHAIN_ID.FANTOM]: "Fantom",
  [CHAIN_ID.BSC]: "Bnb",
  [CHAIN_ID.AVAX]: "Avax",
};

export const NATIVE_WRAPPED_TOKEN_ADDRESS = {
  [CHAIN_ID.MAINNET]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [CHAIN_ID.ROPSTEN]: "0xc778417e063141139fce010982780140aa0cd5ab",
  [CHAIN_ID.GOERLI]: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  [CHAIN_ID.MATIC]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  [CHAIN_ID.FANTOM]: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  [CHAIN_ID.BSC]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  [CHAIN_ID.AVAX]: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
};

export const GENERIC_GAS_LIMIT_ORDER_EXECUTION = "400000";

export const GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS = {
  [CHAIN_ID.MATIC]: "0xE912CD26C4A4cfffc175A297F1328aB23313a1a7",
};

export const STOP_LIMIT_ORDER_SUBGRAPH_URL = {
  [CHAIN_ID.MATIC]:
    "https://api.thegraph.com/subgraphs/name/harrytgerman/stoplimitorder",
};
