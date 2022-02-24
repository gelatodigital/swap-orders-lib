[![npm version](https://badge.fury.io/js/%40gelatonetwork%2Flimit-orders-lib.svg)](https://badge.fury.io/js/%40gelatonetwork%2Flimit-orders-lib)

# Gelato Limit Order SDK

Place limit buy and sell orders on Ethereum, Polygon and Fantom using Gelato Network.

> :warning: :warning: :warning: **Warning** :warning: :warning: :warning: :
> Version 2.0.0 introduced new features and our system changed to an approval/transferFrom flow. You should use the latest version available (>= 2.0.0). If you are using an old version you should update to the latest version immediately. Versions below 2.0.0 are being deprecated.

## [Demo - Sorbet Finance](https://www.sorbet.finance)

## Installation

`yarn add -D @gelatonetwork/limit-orders-lib`

or

`npm install --save-dev @gelatonetwork/limit-orders-lib`

## Getting Started

Instantiate GelatoLimitOrders

```typescript
import {
  GelatoLimitOrders,
  GelatoStopLimitOrders,
  utils,
} from "@gelatonetwork/limit-orders-lib";

// Supported networks: Mainnet = 1; Ropsten = 3; Polygon = 137; Fantom = 250; Avalanche = 43114;  BSC = 56
const chainId = 1;
const signerOrProvider = await provider.getSigner();
const handler = "uniswap";
// | "spookyswap"
// | "spookyswap_stoplimit"
// | "uniswap"
// | "uniswap_stoplimit"
// | "quickswap"
// | "quickswap_stoplimit"
// | "spiritswap"
// | "spiritswap_stoplimit"
// | "bombswap"
// | "polydex"
// | "cafeswap"
// | "pancakeswap"
// | "pancakeswap_stoplimit"
// | "traderjoe"
// | "traderjoe_stoplimit"
// | "defyswap"
// | "pangolin"
// | "pangolin_stoplimit";

const gelatoLimitOrders = new GelatoLimitOrders(
  chainId as ChainId,
  signerOrProvider, // optional
  handler // optional
);

const gelatoStopLimitOrders = new GelatoStopLimitOrders(
  chainId as ChainId,
  signerOrProvider, // optional
  handler // required
);
```

Note: Use `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` when referring to native blockchain asset (i.e MATIC, FTM or ETH)

### Examples

1. Submit an order

Note: To submit a order with an ERC20 as input you must first approve the `erc20OrderRouter`. You can get its address via `gelatoLimitOrders.erc20OrderRouter.address` or call `gelatoLimitOrders.approveTokenAmount(inputToken, inputAmount)`.

```typescript
// Token to sell
const inputToken = "0x6b175474e89094c44da98b954eedeac495271d0f"; // DAI

// Token to buy
const outputToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH

// Amount to sell
const inputAmount = ethers.utils.parseUnits("2000", "18");

// Minimum amount of outToken which the users wants to receive back
const minReturn = ethers.utils.parseEther("1");

// Address of user who places the order (must be same as signer address)
const userAddress = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

await gelatoLimitOrders.approveTokenAmount(inputToken, inputAmount);

const tx = await gelatoLimitOrders.submitLimitOrder(
  inputToken,
  outputToken,
  inputAmount,
  minReturn
);

// Maximum amount of outToken which the users wants to receive back => stop-limit price
const maxReturn = ethers.utils.parseEther("1");

const tx = await gelatoStopLimitOrders.submitStopLimitOrder(
  inputToken,
  outputToken,
  inputAmount,
  maxReturn
);
```

2. Cancel an order

```typescript
const tx = await gelatoLimitOrders.cancelLimitOrder(
  order,
  true // Optional: checkIsActiveOrder = true, to check if order to be cancelled actually exists. It is recommended to use this check before trying to cancel an order to avoid faulty cancellations and gas waste.
);
const tx = await gelatoStopLimitOrders.cancelStopLimitOrder(
  order,
  true // Optional: checkIsActiveOrder = true, to check if order to be cancelled actually exists. It is recommended to use this check before trying to cancel an order to avoid faulty cancellations and gas waste.
);
```

3. Fetch orders

Note: to display the minimum amount returned (i.e the output amount of the order) you should always use the `adjustedMinReturn` field of the order.

Note 2: If you instantiated the library by passing an `handler`, all orders fetched will be filtered accordingly. Otherwise, orders will not be filtered.

```javascript
const allOrders = await gelatoLimitOrders.getOrders(userAddress);
```

## Types

```typescript
export class GelatoLimitOrders {
  static slippageBPS: number;

  get chainId(): ChainId;
  get gelatoFeeBPS(): number;
  get signer(): Signer | undefined;
  get provider(): Provider | undefined;
  get subgraphUrl(): string;
  get handler(): Handler | undefined;
  get handlerAddress(): string | undefined;
  get moduleAddress(): string;
  get contract(): GelatoLimitOrdersContract;
  get erc20OrderRouter(): ERC20OrderRouter;
  constructor(chainId: ChainId, signerOrProvider?: Signer, handler?: Handler);
  encodeLimitOrderSubmission(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    minReturn: BigNumberish,
    owner: string,
    // If inputToken is an ERC20, compare allowance with inputAmount. defaults to `true`
    checkAllowance?: boolean
  ): Promise<TransactionData>;
  encodeLimitOrderSubmissionWithSecret(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    minReturn: BigNumberish,
    owner: string,
    // If inputToken is an ERC20, compare allowance with inputAmount. defaults to `true`
    checkAllowance?: boolean
  ): Promise<TransactionDataWithSecret>;
  submitLimitOrder(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    minReturn: BigNumberish,
    // If inputToken is an ERC20, compare allowance with inputAmount. defaults to `true`
    checkAllowance?: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;
  encodeLimitOrderCancellation(
    order: Order,
    checkIsActiveOrder?: boolean
  ): Promise<TransactionData>;
  cancelLimitOrder(
    order: Order,
    checkIsActiveOrder?: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;
  approveTokenAmount(
    inputToken: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;
  isActiveOrder(order: Order): Promise<boolean>;
  getExchangeRate(
    inputValue: BigNumberish,
    inputDecimals: number,
    outputValue: BigNumberish,
    outputDecimals: number,
    invert?: boolean
  ): string;
  getFeeAndSlippageAdjustedMinReturn(
    outputAmount: BigNumberish,
    extraSlippageBPS?: number
  ): {
    minReturn: string;
    slippage: string;
    gelatoFee: string;
  };
  getAdjustedMinReturn(
    minReturn: BigNumberish,
    extraSlippageBPS?: number
  ): string;
  getExecutionPrice(
    inputAmount: BigNumberish,
    inputDecimals: number,
    outputAmount: BigNumberish,
    outputDecimals: number,
    isInverted?: boolean
  ): string;
  getOrders(
    owner: string,
    // includeOrdersWithNullHandler defaults to `false`
    includeOrdersWithNullHandler?: boolean
  ): Promise<Order[]>;
  getOpenOrders(
    owner: string,
    // includeOrdersWithNullHandler defaults to `false`
    includeOrdersWithNullHandler?: boolean
  ): Promise<Order[]>;
  getPastOrders(
    owner: string,
    // includeOrdersWithNullHandler defaults to `false`
    includeOrdersWithNullHandler?: boolean
  ): Promise<Order[]>;
  getExecutedOrders(
    owner: string,
    // includeOrdersWithNullHandler defaults to `false`
    includeOrdersWithNullHandler?: boolean
  ): Promise<Order[]>;
  getCancelledOrders(
    owner: string,
    // includeOrdersWithNullHandler defaults to `false`
    includeOrdersWithNullHandler?: boolean
  ): Promise<Order[]>;
}

export declare class GelatoBase {
  get chainId(): ChainId;
  get slippageBPS(): number;
  get gelatoFeeBPS(): number;
  get signer(): Signer | undefined;
  get provider(): Provider | undefined;
  get subgraphUrl(): string;
  get handler(): Handler | undefined;
  get handlerAddress(): string | undefined;
  get moduleAddress(): string;
  get contract(): GelatoBaseContract;
  get erc20OrderRouter(): ERC20OrderRouter;
  get abiEncoder(): any;
  constructor(
    chainId: ChainId,
    moduleAddress: string,
    signerOrProvider?: Signer | Provider,
    handler?: Handler,
    handlerAddress?: string
  );
  encodeLimitOrderCancellation(
    order: StopLimitOrder,
    checkIsActiveOrder?: boolean
  ): Promise<TransactionData>;
  cancelStopLimitOrder(
    order: StopLimitOrder,
    checkIsActiveOrder?: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;
  approveTokenAmount(
    inputToken: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;
  isActiveOrder(order: StopLimitOrder): Promise<boolean>;
  getExchangeRate(
    inputValue: BigNumberish,
    inputDecimals: number,
    outputValue: BigNumberish,
    outputDecimals: number,
    invert?: boolean
  ): string;
  getFeeAndSlippageAdjustedMinReturn(
    outputAmount: BigNumberish,
    extraSlippageBPS?: number
  ): {
    minReturn: string;
    slippage: string;
    gelatoFee: string;
  };
  getAdjustedMinReturn(
    minReturn: BigNumberish,
    extraSlippageBPS?: number
  ): string;
  getExecutionPrice(
    inputAmount: BigNumberish,
    inputDecimals: number,
    outputAmount: BigNumberish,
    outputDecimals: number,
    isInverted?: boolean
  ): string;
  getPastStopLimitOrders(owner: string): Promise<StopLimitOrder[]>;
  _getKey(order: StopLimitOrder): string;
}

class GelatoStopLimitOrders extends GelatoBase {
  constructor(
    chainId: ChainId,
    signerOrProvider?: Signer | Provider,
    handler?: Handler
  );
  submitStopLimitOrder(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturn: BigNumberish,
    checkAllowance?: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;
  encodeStopLimitOrderSubmission(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturn: BigNumberish,
    owner: string,
    checkAllowance?: boolean
  ): Promise<TransactionData>;
  encodeStopLimitOrderSubmissionWithSecret(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturnToBeParsed: BigNumberish,
    owner: string,
    checkAllowance?: boolean
  ): Promise<TransactionDataWithSecret>;
  _encodeSubmitData(
    inputToken: string,
    outputToken: string,
    owner: string,
    witness: string,
    amount: BigNumberish,
    maxReturn: BigNumberish,
    minReturn: BigNumberish,
    secret: string,
    checkAllowance: boolean
  ): Promise<TransactionData>;
  getOpenStopLimitOrders(owner: string): Promise<StopLimitOrder[]>;
  getStopLimitOrders(owner: string): Promise<StopLimitOrder[]>;
  getExecutedStopLimitOrders(owner: string): Promise<StopLimitOrder[]>;
  getCancelledStopLimitOrders(owner: string): Promise<StopLimitOrder[]>;
  getPastStopLimitOrders(owner: string): Promise<StopLimitOrder[]>;
}

export declare type ChainId = 1 | 3 | 56 | 137 | 250 | 43114;

export type Handler =
  | "spookyswap"
  | "spookyswap_stoplimit"
  | "uniswap"
  | "uniswap_stoplimit"
  | "quickswap"
  | "quickswap_stoplimit"
  | "spiritswap"
  | "spiritswap_stoplimit"
  | "bombswap"
  | "polydex"
  | "cafeswap"
  | "pancakeswap"
  | "pancakeswap_stoplimit"
  | "traderjoe"
  | "traderjoe_stoplimit"
  | "defyswap"
  | "pangolin"
  | "pangolin_stoplimit";

export interface TransactionData {
  to: string;
  data: BytesLike;
  value: BigNumberish;
}

export interface TransactionDataWithSecret {
  payload: TransactionData;
  secret: string;
  witness: string;
  order: PartialOrder;
}

export interface Order {
  id: string;
  owner: string;
  inputToken: string;
  outputToken: string;
  minReturn: string;
  maxReturn?: string;
  adjustedMinReturn: string;
  module: string;
  witness: string;
  secret: string;
  inputAmount: string;
  vault: string;
  bought: string | null;
  auxData: string | null;
  status: string;
  createdTxHash: string;
  executedTxHash: string | null;
  cancelledTxHash: string | null;
  blockNumber: string;
  createdAt: string;
  updatedAt: string;
  updatedAtBlock: string;
  updatedAtBlockHash: string;
  data: string;
  inputData: string;
  handler: string | null;
  isExpired: boolean;
}

export interface PartialOrder {
  owner: string;
  inputToken: string;
  outputToken: string;
  minReturn: string;
  adjustedMinReturn: string;
  module: string;
  witness: string;
  secret: string;
  inputAmount: string;
  data: string;
  inputData: string;
  handler?: string;
}
```

### Need help?

Reach out to us on [Telegram](https://t.me/therealgelatonetwork), [Discord](https://discord.gg/ApbA39BKyJ) or [Twitter](https://twitter.com/gelatonetwork)
