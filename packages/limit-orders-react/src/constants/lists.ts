// used to mark unsupported tokens, these are hosted lists of unsupported tokens

const COMPOUND_LIST =
  "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json";
const COINGECKO_LIST = "https://tokens.coingecko.com/uniswap/all.json";
// const CMC_ALL_LIST = "defi.cmc.eth";
// const CMC_STABLECOIN = "stablecoin.cmc.eth";
// const KLEROS_LIST = "t2crtokens.eth";
// const ROLL_LIST = "https://app.tryroll.com/tokens.json";
// const UMA_LIST = "https://umaproject.org/uma.tokenlist.json";
// const AAVE_LIST = "tokenlist.aave.eth";
// const SYNTHETIX_LIST = "synths.snx.eth";
// const WRAPPED_LIST = "wrapped.tokensoft.eth";
// const SET_LIST =
//   "https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json";

const GEMINI_LIST = "https://www.gemini.com/uniswap/manifest.json";
const BA_LIST =
  "https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json";

const QUICKSWAP_LIST =
  "https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json";

const PANCAKESWAP_LIST =
  "https://tokens.pancakeswap.finance/pancakeswap-extended.json";

const PANGOLIN_LIST =
  "https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json";

const VVS_LIST =
  "https://raw.githubusercontent.com/HarryTgerman/vvs-tokenlist/main/vvs-tokenlist.json";

export const UNSUPPORTED_LIST_URLS: string[] = [BA_LIST];

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS_MAINNET: string[] = [
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
  COMPOUND_LIST,
  COINGECKO_LIST,
  GEMINI_LIST,
];

export const DEFAULT_LIST_OF_LISTS_MATIC: string[] = [QUICKSWAP_LIST];
export const DEFAULT_LIST_OF_LISTS_BSC: string[] = [PANCAKESWAP_LIST];
export const DEFAULT_LIST_OF_LISTS_AVALANCHE: string[] = [PANGOLIN_LIST];
export const DEFAULT_LIST_OF_LISTS_CRO: string[] = [VVS_LIST];

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  GEMINI_LIST,
  QUICKSWAP_LIST,
  PANCAKESWAP_LIST,
  PANGOLIN_LIST,
  VVS_LIST,
];

export const DEFAULT_ACTIVE_LIST_URLS_BY_CHAIN_ID: {
  [chainId: number]: string[];
} = {
  [1]: DEFAULT_ACTIVE_LIST_URLS,
  [25]: [VVS_LIST],
  [56]: [PANCAKESWAP_LIST],
  [137]: [QUICKSWAP_LIST],
  [43114]: [PANGOLIN_LIST],
};
