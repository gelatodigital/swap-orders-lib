export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const CHAIN_ID = {
  MAINNET: 1,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  MATIC: 137,
  GOERLI: 5,
};

export const NETWORK_NAME = {
  [CHAIN_ID.MAINNET]: "Ethereum",
  [CHAIN_ID.OPTIMISM]: "Optimism",
  [CHAIN_ID.ARBITRUM]: "Arbitrum",
  [CHAIN_ID.MATIC]: "Polygon (matic)",
  [CHAIN_ID.GOERLI]: "Goerli",
};

export const SUBGRAPH_URL = {
  [CHAIN_ID.MAINNET]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/range-orders-mainnet",
  [CHAIN_ID.OPTIMISM]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/range-orders-optimism",
  [CHAIN_ID.ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/range-orders-arbitrum",
  [CHAIN_ID.MATIC]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/range-orders-matic",
  [CHAIN_ID.GOERLI]:
    "https://api.thegraph.com/subgraphs/name/gelatodigital/range-orders-goerli",
};

export const GELATO_RANGE_ORDERS_ADDRESS = {
  [CHAIN_ID.MAINNET]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.OPTIMISM]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.ARBITRUM]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.MATIC]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.GOERLI]: "0x0000000000000000000000000000000000000000",
};

export const GELATO_EJECT_LP_ADDRESS = {
  [CHAIN_ID.MAINNET]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.OPTIMISM]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.ARBITRUM]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.MATIC]: "0x0000000000000000000000000000000000000000",
  [CHAIN_ID.GOERLI]: "0x0000000000000000000000000000000000000000",
};
