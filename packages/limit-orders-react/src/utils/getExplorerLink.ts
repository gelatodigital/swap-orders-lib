export enum ExplorerDataType {
  TRANSACTION = "transaction",
  TOKEN = "token",
  ADDRESS = "address",
  BLOCK = "block",
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(
  chainId: number,
  data: string,
  type: ExplorerDataType
): string {
  let prefix;

  if (chainId === 1) prefix = `https://etherscan.io`;
  else if (chainId === 3) prefix = `https://ropsten.etherscan.io`;
  else if (chainId === 56) prefix = `https://bscscan.com`;
  else if (chainId === 137) prefix = `https://polygonscan.com`;
  else if (chainId === 250) prefix = `https://ftmscan.com`;
  else if (chainId === 43114) prefix = `https://snowtrace.io`;

  switch (type) {
    case ExplorerDataType.TRANSACTION: {
      return `${prefix}/tx/${data}`;
    }
    case ExplorerDataType.TOKEN: {
      return `${prefix}/token/${data}`;
    }
    case ExplorerDataType.BLOCK: {
      return `${prefix}/block/${data}`;
    }
    case ExplorerDataType.ADDRESS:
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}
