import { parseBytes32String } from "@ethersproject/strings";
import { Currency, Ether, NativeCurrency, Token } from "@uniswap/sdk-core";
import { arrayify } from "@ethersproject/bytes";
import { useMemo } from "react";
import {
  useAllLists,
  useCombinedActiveList,
  useInactiveListUrls,
} from "../state/glists/hooks";
import { WrappedTokenInfo } from "../state/glists/wrappedTokenInfo";
import { NEVER_RELOAD, useSingleCallResult } from "../state/gmulticall/hooks";
import { useUserAddedTokens } from "../state/guser/hooks";
import { isAddress } from "../utils";
import {
  TokenAddressMap,
  useUnsupportedTokenList,
} from "./../state/glists/hooks";
import { useBytes32TokenContract, useTokenContract } from "./useContract";
import invariant from "tiny-invariant";
import { Contract } from "@ethersproject/contracts";
import { TokenInfo } from "@uniswap/token-lists";
import { NATIVE } from "../constants/addresses";
import { useWeb3 } from "../web3";
import { WFTM_FANTOM } from "../constants/tokens.fantom";
import { WMATIC_MATIC } from "../constants/tokens.matic";
import { WBNB_BSC } from "../constants/tokens.bsc";
import { WAVAX_AVAX } from "../constants/tokens.avax";
import { WCRO_CRONOS } from "../constants/tokens.cronos";

export const WETH9: { [chainId: number]: Token } = {
  [1]: new Token(
    1,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    18,
    "WETH9",
    "Wrapped Ether"
  ),
  [3]: new Token(
    3,
    "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    18,
    "WETH9",
    "Wrapped Ether"
  ),
  [4]: new Token(
    4,
    "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    18,
    "WETH9",
    "Wrapped Ether"
  ),
  [5]: new Token(
    5,
    "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    18,
    "WETH9",
    "Wrapped Ether"
  ),
  [42]: new Token(
    42,
    "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
    18,
    "WETH9",
    "Wrapped Ether"
  ),
};

export class NativeToken extends NativeCurrency {
  public constructor(
    chainId: number,
    decimals: number,
    symbol: string,
    name: string
  ) {
    super(chainId, decimals, symbol, name);
  }

  public get wrapped(): Token {
    const weth9 =
      this.chainId === 25
        ? WCRO_CRONOS
        : this.chainId === 56
        ? WBNB_BSC
        : this.chainId === 137
        ? WMATIC_MATIC
        : this.chainId === 250
        ? WFTM_FANTOM
        : this.chainId === 43114
        ? WAVAX_AVAX
        : WETH9[this.chainId];
    invariant(!!weth9, "WRAPPED");
    return weth9;
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }
}

const alwaysTrue = () => true;

/**
 * Create a filter function to apply to a token for whether it matches a particular search query
 * @param search the search query to apply to the token
 */
export function createTokenFilterFunction<T extends Token | TokenInfo>(
  search: string
): (tokens: T) => boolean {
  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    const lower = searchingAddress.toLowerCase();
    return (t: T) =>
      "isToken" in t
        ? searchingAddress === t.address
        : lower === t.address.toLowerCase();
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) return alwaysTrue;

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);

    return lowerSearchParts.every(
      (p) =>
        p.length === 0 ||
        sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p))
    );
  };

  return ({ name, symbol }: T): boolean =>
    Boolean((symbol && matchesSearch(symbol)) || (name && matchesSearch(name)));
}

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(
  tokenMap: TokenAddressMap,
  includeUserAdded: boolean
): { [address: string]: Token } {
  const { chainId } = useWeb3();
  const userAddedTokens = useUserAddedTokens();

  return useMemo(() => {
    if (!chainId) return {};
    if (!tokenMap[chainId]) return {};

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{
      [address: string]: Token;
    }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token;
      return newMap;
    }, {});

    if (includeUserAdded) {
      return (
        userAddedTokens
          // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
            (tokenMap, token) => {
              tokenMap[token.address] = token;
              return tokenMap;
            },
            // must make a copy because reduce modifies the map, and we do not
            // want to make a copy in every iteration
            { ...mapWithoutUrls }
          )
      );
    }

    return mapWithoutUrls;
  }, [chainId, userAddedTokens, tokenMap, includeUserAdded]);
}

export function useAllTokens(): { [address: string]: Token } {
  const allTokens = useCombinedActiveList();
  return useTokensFromMap(allTokens, true);
}

export function useUnsupportedTokens(): { [address: string]: Token } {
  const unsupportedTokensMap = useUnsupportedTokenList();
  return useTokensFromMap(unsupportedTokensMap, false);
}

export function useSearchInactiveTokenLists(
  search: string | undefined,
  minResults = 10
): WrappedTokenInfo[] {
  const { chainId } = useWeb3();
  const lists = useAllLists();
  const inactiveUrls = useInactiveListUrls();
  const activeTokens = useAllTokens();
  return useMemo(() => {
    if (!search || search.trim().length === 0) return [];
    const tokenFilter = createTokenFilterFunction(search);
    const result: WrappedTokenInfo[] = [];
    const addressSet: { [address: string]: true } = {};
    for (const url of inactiveUrls) {
      const list = lists[url].current;
      if (!list) continue;
      for (const tokenInfo of list.tokens) {
        if (tokenInfo.chainId === chainId && tokenFilter(tokenInfo)) {
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo(
            tokenInfo,
            list
          );
          if (
            !(wrapped.address in activeTokens) &&
            !addressSet[wrapped.address]
          ) {
            addressSet[wrapped.address] = true;
            result.push(wrapped);
            if (result.length >= minResults) return result;
          }
        }
      }
    }
    return result;
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search]);
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
  const activeTokens = useAllTokens();

  if (!activeTokens || !token) {
    return false;
  }

  return !!activeTokens[token.address];
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(
  currency: Currency | undefined | null
): boolean {
  const userAddedTokens = useUserAddedTokens();

  if (!currency) {
    return false;
  }

  return !!userAddedTokens.find((token) => currency.equals(token));
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function parseStringOrBytes32(
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string
): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const tokens = useAllTokens();
  const { chainId } = useWeb3();
  const address = isAddress(tokenAddress);

  const tokenContract = (useTokenContract(
    address ? address : undefined,
    false
  ) as unknown) as Contract;

  const tokenContractBytes32 = useBytes32TokenContract(
    address ? address : undefined,
    false
  );
  const token: Token | undefined = address ? tokens[address] : undefined;

  const tokenName = useSingleCallResult(
    token ? undefined : tokenContract,
    "name",
    undefined,
    NEVER_RELOAD
  );

  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    "name",
    undefined,
    NEVER_RELOAD
  );
  const symbol = useSingleCallResult(
    token ? undefined : tokenContract,
    "symbol",
    undefined,
    NEVER_RELOAD
  );

  const symbolBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    "symbol",
    undefined,
    NEVER_RELOAD
  );
  const decimals = useSingleCallResult(
    token ? undefined : tokenContract,
    "decimals",
    undefined,
    NEVER_RELOAD
  );

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return undefined;
    if (decimals.loading || symbol.loading || tokenName.loading) return null;
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(
          symbol.result?.[0],
          symbolBytes32.result?.[0],
          "UNKNOWN"
        ),
        parseStringOrBytes32(
          tokenName.result?.[0],
          tokenNameBytes32.result?.[0],
          "Unknown Token"
        )
      );
    }
    return undefined;
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ]);
}

export function useCurrency(
  currencyId: string | undefined
): Currency | null | undefined {
  const { chainId } = useWeb3();

  const isETH = currencyId?.toUpperCase() === "ETH";
  const isMATIC = currencyId?.toUpperCase() === "MATIC";
  const isFTM = currencyId?.toUpperCase() === "FTM";
  const isBNB = currencyId?.toUpperCase() === "BNB";
  const isAVAX = currencyId?.toUpperCase() === "AVAX";
  const isCRO = currencyId?.toUpperCase() === "CRO";
  const isNative =
    currencyId?.toUpperCase() === "NATIVE" ||
    currencyId?.toLowerCase() === NATIVE.toLowerCase();
  const isNativeCurrency =
    isETH || isMATIC || isFTM || isBNB || isAVAX || isCRO || isNative;
  const token = useToken(isNativeCurrency ? undefined : currencyId);
  if (isNativeCurrency && chainId)
    return chainId === 25
      ? new NativeToken(chainId, 18, "CRO", "Cronos")
      : chainId === 56
      ? new NativeToken(chainId, 18, "BNB", "Binance Coin")
      : chainId === 137
      ? new NativeToken(chainId, 18, "MATIC", "Matic")
      : chainId === 250
      ? new NativeToken(chainId, 18, "FTM", "Fantom")
      : chainId === 43114
      ? new NativeToken(chainId, 18, "AVAX", "Avax")
      : Ether.onChain(chainId);
  else return token;
}
