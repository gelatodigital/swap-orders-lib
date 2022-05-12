import {
  BigNumber,
  constants,
  utils,
  ContractTransaction,
  BigNumberish,
  Contract,
  Wallet,
  Overrides,
  Bytes,
} from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import {
  CHAIN_ID,
  ETH_ADDRESS,
  GELATO_LIMIT_ORDERS_V2_ADDRESS,
  GELATO_LIMIT_ORDERS_MODULE_FLASHBOTS_ADDRESS,
  NETWORK_HANDLERS,
  SUBGRAPH_URL,
  BPS_GELATO_FEE,
  LIMIT_ORDER_SLIPPAGE,
} from "../constants";
import {
  ERC20__factory,
  GelatoUniswapV2LimitOrders,
  GelatoUniswapV2LimitOrders__factory,
} from "../contracts/types";
import {
  queryCancelledOrdersV2,
  queryExecutedOrdersV2,
  queryOpenOrdersV2,
  queryOrderV2,
  queryOrdersV2,
  queryPastOrdersV2,
} from "../utils/queries";
import {
  Handler,
  ChainId,
  Order,
  OrderV2,
  TransactionData,
  TransactionDataWithSalt,
} from "../types";
import { isEthereumChain, isNetworkGasToken } from "../utils";

export const isValidChainIdAndHandler = (
  chainId: ChainId,
  handler: Handler
): boolean => {
  return NETWORK_HANDLERS[chainId].includes(handler);
};

export const isFlashbotsCompatibleChainId = (chainId: ChainId): boolean => {
  return chainId == CHAIN_ID.MAINNET || chainId == CHAIN_ID.GOERLI;
};

export class GelatoLimitOrders {
  private _chainId: ChainId;
  private _routerAddress: string;
  private _factoryAddress: string;
  private _initCodeHash: string;
  private _provider: Provider | undefined;
  private _signer: Signer | undefined;
  private _gelatoUniswapV2LimitOrders: GelatoUniswapV2LimitOrders;
  private _subgraphUrl: string;
  private _abiEncoder: utils.AbiCoder;
  private _isFlashbotsProtected: boolean;
  private _gelatoFeeBPS: number;
  private _slippageBPS: number;

  get gelatoFeeBPS(): number {
    return this._gelatoFeeBPS;
  }

  get slippageBPS(): number {
    return this._slippageBPS;
  }

  get chainId(): ChainId {
    return this._chainId;
  }

  get signer(): Signer | undefined {
    return this._signer;
  }

  get provider(): Provider | undefined {
    return this._provider;
  }

  get subgraphUrl(): string {
    return this._subgraphUrl;
  }

  get contract(): GelatoUniswapV2LimitOrders {
    return this._gelatoUniswapV2LimitOrders;
  }

  get isFlashbotsProtected(): boolean {
    return this._isFlashbotsProtected;
  }

  constructor(
    chainId: ChainId,
    router: string,
    factory: string,
    initCodeHash: string,
    isFlashbotsProtected = false,
    signerOrProvider?: Signer | Provider
  ) {
    if (!router) {
      throw new Error("No Router defined");
    }
    if (!factory) {
      throw new Error("No Factory defined");
    }
    if (!initCodeHash) {
      throw new Error("No InitCodeHash defined");
    }

    this._chainId = chainId;
    this._gelatoFeeBPS = BPS_GELATO_FEE[chainId];
    this._slippageBPS = LIMIT_ORDER_SLIPPAGE[chainId];
    this._subgraphUrl = SUBGRAPH_URL[chainId];
    this._signer = Signer.isSigner(signerOrProvider)
      ? signerOrProvider
      : undefined;
    this._provider = Provider.isProvider(signerOrProvider)
      ? signerOrProvider
      : Signer.isSigner(signerOrProvider)
      ? signerOrProvider.provider
      : undefined;

    this._gelatoUniswapV2LimitOrders = this._signer
      ? GelatoUniswapV2LimitOrders__factory.connect(
          GELATO_LIMIT_ORDERS_V2_ADDRESS[this._chainId],
          this._signer
        )
      : this._provider
      ? GelatoUniswapV2LimitOrders__factory.connect(
          GELATO_LIMIT_ORDERS_V2_ADDRESS[this._chainId],
          this._provider
        )
      : (new Contract(
          GELATO_LIMIT_ORDERS_V2_ADDRESS[this._chainId],
          GelatoUniswapV2LimitOrders__factory.createInterface()
        ) as GelatoUniswapV2LimitOrders);

    this._routerAddress = router;
    this._factoryAddress = factory;
    this._initCodeHash = initCodeHash;

    this._isFlashbotsProtected = isFlashbotsProtected;

    this._abiEncoder = new utils.AbiCoder();
  }

  public async encodeLimitOrderSubmission(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    minReturn: BigNumberish,
    owner: string,
    checkAllowance = true
  ): Promise<TransactionData> {
    const { payload } = await this.encodeLimitOrderSubmissionWithSalt(
      inputToken,
      outputToken,
      inputAmount,
      minReturn,
      owner,
      checkAllowance
    );

    return payload;
  }

  public async encodeLimitOrderSubmissionWithSalt(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    minReturnToBeParsed: BigNumberish,
    owner: string,
    checkAllowance = true
  ): Promise<TransactionDataWithSalt> {
    if (!this._signer) throw new Error("No signer");

    const salt = BigNumber.from(utils.randomBytes(32));

    const { minReturn } =
      this.getFeeAndSlippageAdjustedMinReturn(minReturnToBeParsed);

    const payload = await this._encodeSubmitData(
      inputToken,
      outputToken,
      owner,
      salt,
      inputAmount,
      minReturn,
      checkAllowance
    );

    const encodedData = "0x00";

    const orderKey = await this._gelatoUniswapV2LimitOrders.keyOf({
      owner,
      inputToken,
      outputToken,
      factory: this._factoryAddress,
      router: this._routerAddress,
      amountIn: inputAmount,
      minReturn,
      salt,
      initCodeHash: this._initCodeHash,
      data: encodedData,
    });

    return {
      payload,
      order: {
        id: orderKey,
        data: encodedData,
        inputToken: inputToken.toLowerCase(),
        outputToken: outputToken.toLowerCase(),
        owner: owner.toLowerCase(),
        inputAmount: inputAmount.toString(),
        minReturn: minReturn.toString(),
        adjustedMinReturn: minReturnToBeParsed.toString(),
        inputData: payload.data.toString(),
        router: this._routerAddress.toString(),
        factory: this._factoryAddress.toString(),
        initCodeHash: this._initCodeHash.toString(),
        salt: salt.toString(),
      },
    };
  }

  public async submitLimitOrder(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    minReturn: BigNumberish,
    checkAllowance = true,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (!this._signer) throw new Error("No signer");

    const owner = await this._signer.getAddress();

    const txData = await this.encodeLimitOrderSubmission(
      inputToken,
      outputToken,
      inputAmount,
      minReturn,
      owner,
      checkAllowance
    );

    return this._signer.sendTransaction({
      ...overrides,
      to: txData.to,
      data: txData.data,
      value: BigNumber.from(txData.value),
    });
  }

  public async encodeLimitOrderCancellation(
    order: OrderV2,
    checkIsActiveOrder?: boolean
  ): Promise<TransactionData> {
    if (!this._gelatoUniswapV2LimitOrders)
      throw new Error("No gelato limit orders contract");

    if (!order.inputToken) throw new Error("No input token in order");
    if (!order.outputToken) throw new Error("No output token in order");
    if (!order.minReturn) throw new Error("No minReturn in order");
    if (!order.owner) throw new Error("No owner");

    if (checkIsActiveOrder) {
      const isActiveOrder = await this.isActiveOrder(order);
      if (!isActiveOrder)
        throw new Error("Order not found. Please review your order data.");
    }

    const data = this._gelatoUniswapV2LimitOrders.interface.encodeFunctionData(
      "cancelOrder",
      [this._toOrderStruct(order)]
    );

    return {
      data,
      to: this._gelatoUniswapV2LimitOrders.address,
      value: constants.Zero,
    };
  }

  public async cancelLimitOrder(
    order: OrderV2,
    checkIsActiveOrder?: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (!this._signer) throw new Error("No signer");
    if (!this._gelatoUniswapV2LimitOrders)
      throw new Error("No gelato limit orders contract");

    let _order = order;

    if (order.id) {
      try {
        const subgraphOrder = await Promise.race([
          this.getOrder(order.id),
          new Promise((resolve) => setTimeout(resolve, 5_000)).then(() => {
            throw new Error("Timeout");
          }),
        ]);

        if (subgraphOrder) {
          if (subgraphOrder.status === "cancelled") {
            throw new Error(
              `Order status is not open. Current order status: ${subgraphOrder.status}. Cancellation transaction hash: ${subgraphOrder.cancelledTxHash}`
            );
          }

          if (subgraphOrder.status === "executed") {
            throw new Error(
              `Order status is not open. Current order status: ${subgraphOrder.status}. Execution transaction hash: ${subgraphOrder.executedTxHash}`
            );
          }

          _order = { ...order, ...subgraphOrder };
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }

    if (!_order.inputToken) throw new Error("No input token in order");
    if (!_order.outputToken) throw new Error("No output token in order");
    if (!_order.minReturn) throw new Error("No minReturn in order");
    if (!_order.data) throw new Error("No data in order");

    if (checkIsActiveOrder) {
      const isActiveOrder = await this.isActiveOrder(_order);
      if (!isActiveOrder)
        throw new Error("Order not found. Please review your order data.");
    }

    const owner = await this._signer.getAddress();

    if (owner.toLowerCase() !== order.owner.toLowerCase())
      throw new Error("Owner and signer mismatch");

    const oderStruct = this._toOrderStruct(_order);

    return this._gelatoUniswapV2LimitOrders.cancelOrder(
      oderStruct,
      overrides ?? {
        gasLimit: isEthereumChain(this._chainId) ? 600_000 : 2_000_000,
      }
    );
  }

  public async approveTokenAmount(
    inputToken: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (!this._signer) throw new Error("No signer");

    return overrides
      ? ERC20__factory.connect(inputToken, this._signer).approve(
          this._gelatoUniswapV2LimitOrders.address,
          amount,
          overrides
        )
      : ERC20__factory.connect(inputToken, this._signer).approve(
          this._gelatoUniswapV2LimitOrders.address,
          amount
        );
  }

  public async isActiveOrder(order: OrderV2): Promise<boolean> {
    if (!this._provider) throw new Error("No provider");
    if (!this._gelatoUniswapV2LimitOrders)
      throw new Error("No gelato limit orders contract");

    if (!order.inputToken) throw new Error("No input token in order");
    if (!order.owner) throw new Error("No owner in order");
    if (!order.data) throw new Error("No data in order");

    return this._gelatoUniswapV2LimitOrders.isActiveOrder(order.id);
  }

  public getExchangeRate(
    inputValue: BigNumberish,
    inputDecimals: number,
    outputValue: BigNumberish,
    outputDecimals: number,
    invert = false
  ): string {
    const factor = BigNumber.from(10).pow(BigNumber.from(18));

    if (invert) {
      return BigNumber.from(inputValue)
        .mul(factor)
        .div(outputValue)
        .mul(BigNumber.from(10).pow(BigNumber.from(outputDecimals)))
        .div(BigNumber.from(10).pow(BigNumber.from(inputDecimals)))
        .toString();
    } else {
      return BigNumber.from(outputValue)
        .mul(factor)
        .div(inputValue)
        .mul(BigNumber.from(10).pow(BigNumber.from(inputDecimals)))
        .div(BigNumber.from(10).pow(BigNumber.from(outputDecimals)))
        .toString();
    }
  }

  public getFeeAndSlippageAdjustedMinReturn(
    outputAmount: BigNumberish,
    extraSlippageBPS?: number
  ): {
    minReturn: string;
    slippage: string;
    gelatoFee: string;
  } {
    if (extraSlippageBPS) {
      if (!Number.isInteger(extraSlippageBPS))
        throw new Error("Extra Slippage BPS must an unsigned integer");
    }

    const gelatoFee = BigNumber.from(outputAmount)
      .mul(this._gelatoFeeBPS)
      .div(10000)
      .gte(1)
      ? BigNumber.from(outputAmount).mul(this._gelatoFeeBPS).div(10000)
      : BigNumber.from(1);

    const slippageBPS = extraSlippageBPS
      ? this._slippageBPS + extraSlippageBPS
      : this._slippageBPS;

    const slippage = BigNumber.from(outputAmount).mul(slippageBPS).div(10000);

    const minReturn = BigNumber.from(outputAmount).sub(gelatoFee).sub(slippage);

    return {
      minReturn: minReturn.toString(),
      slippage: slippage.toString(),
      gelatoFee: gelatoFee.toString(),
    };
  }

  public getAdjustedMinReturn(
    minReturn: BigNumberish,
    extraSlippageBPS?: number
  ): string {
    const gelatoFee = BigNumber.from(this._gelatoFeeBPS);

    const slippage = extraSlippageBPS
      ? BigNumber.from(this._slippageBPS + extraSlippageBPS)
      : BigNumber.from(this._slippageBPS);

    const fees = gelatoFee.add(slippage);

    const adjustedMinReturn = BigNumber.from(minReturn)
      .mul(10000)
      .div(BigNumber.from(10000).sub(fees));

    return adjustedMinReturn.toString();
  }

  public getExecutionPrice(
    inputAmount: BigNumberish,
    inputDecimals: number,
    outputAmount: BigNumberish,
    outputDecimals: number,
    isInverted = false
  ): string {
    const factor = BigNumber.from(10).pow(
      BigNumber.from(isInverted ? outputDecimals : inputDecimals)
    );

    if (isInverted) {
      return BigNumber.from(inputAmount)
        .mul(factor)
        .div(outputAmount)
        .toString();
    } else {
      return BigNumber.from(outputAmount)
        .mul(factor)
        .div(inputAmount)
        .toString();
    }
  }

  public async getOrder(orderId: string): Promise<OrderV2 | null> {
    const order = await queryOrderV2(orderId, this._chainId);
    if (order) {
      return {
        ...order,
        adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
      };
    } else {
      return null;
    }
  }

  public async getOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<OrderV2[]> {
    const orders = await queryOrdersV2(owner, this._chainId);
    return orders.map((order) => ({
      ...order,
      adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
    }));
  }

  public async getOpenOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<OrderV2[]> {
    const orders = await queryOpenOrdersV2(owner, this._chainId);
    return orders.map((order) => ({
      ...order,
      adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
    }));
  }

  public async getPastOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<OrderV2[]> {
    const orders = await queryPastOrdersV2(owner, this._chainId);
    return orders.map((order) => ({
      ...order,
      adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
    }));
  }

  public async getExecutedOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<OrderV2[]> {
    const orders = await queryExecutedOrdersV2(owner, this._chainId);
    return orders.map((order) => ({
      ...order,
      adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
    }));
  }

  public async getCancelledOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<OrderV2[]> {
    const orders = await queryCancelledOrdersV2(owner, this._chainId);
    return orders.map((order) => ({
      ...order,
      adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
    }));
  }

  private _toOrderStruct(order: OrderV2) {
    return {
      owner: order.owner,
      inputToken: order.inputToken,
      outputToken: order.outputToken,
      factory: order.factory,
      router: order.router,
      amountIn: BigNumber.from(order.inputAmount),
      minReturn: BigNumber.from(order.minReturn),
      salt: BigNumber.from(order.salt),
      initCodeHash: utils.formatBytes32String(order.initCodeHash),
      data: order.data,
    };
  }

  private async _encodeSubmitData(
    inputToken: string,
    outputToken: string,
    owner: string,
    salt: BigNumber,
    amountIn: BigNumberish,
    minReturn: BigNumberish,
    checkAllowance: boolean
  ): Promise<TransactionData> {
    if (!this._provider) throw new Error("No provider");

    if (inputToken.toLowerCase() === outputToken.toLowerCase())
      throw new Error("Input token and output token can not be equal");

    const encodedData = "0x00";

    let data, value, to;
    if (isNetworkGasToken(inputToken)) {
      const order = {
        owner,
        inputToken,
        outputToken,
        factory: this._factoryAddress,
        router: this._routerAddress,
        amountIn,
        minReturn,
        salt,
        initCodeHash: this._initCodeHash,
        data: encodedData,
      };

      data = this._gelatoUniswapV2LimitOrders.interface.encodeFunctionData(
        "depositNative",
        [order]
      );
      value = amountIn;
      to = this._gelatoUniswapV2LimitOrders.address;
    } else {
      if (checkAllowance) {
        const allowance = await ERC20__factory.connect(
          inputToken,
          this._provider
        ).allowance(owner, this._gelatoUniswapV2LimitOrders.address);

        if (allowance.lt(amountIn))
          throw new Error("Insufficient token allowance for placing order");
      }

      const order = {
        owner,
        inputToken,
        outputToken,
        factory: this._factoryAddress,
        router: this._routerAddress,
        amountIn,
        minReturn,
        salt,
        initCodeHash: this._initCodeHash,
        data: encodedData,
      };

      data = this._gelatoUniswapV2LimitOrders.interface.encodeFunctionData(
        "depositToken",
        [order]
      );
      value = constants.Zero;
      to = this._gelatoUniswapV2LimitOrders.address;
    }

    return { data, value, to };
  }
}
