import {
  BigNumber,
  constants,
  utils,
  ContractTransaction,
  BigNumberish,
  Contract,
  Overrides,
} from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import {
  CHAIN_ID,
  ETH_ADDRESS,
  NATIVE_WRAPPED_TOKEN_ADDRESS,
  GELATO_LIMIT_ORDERS_ADDRESS,
  GELATO_LIMIT_ORDERS_ERC20_ORDER_ROUTER,
  NETWORK_HANDLERS,
  STOP_LIMIT_SLIPPAGE_BPS,
  SUBGRAPH_URL,
  L2_BPS_GELATO_FEE,
} from "../constants";
import {
  ERC20OrderRouter,
  ERC20OrderRouter__factory,
  ERC20__factory,
  GelatoLimitOrders as GelatoBaseContract,
  GelatoLimitOrders__factory as GelatoBase__factory,
} from "../contracts/types";
import { queryPastOrders } from "../utils/queries/stoplimit";
import { Handler, ChainId, StopLimitOrder, TransactionData } from "../types";
import { isEthereumChain } from "../utils";

export const isValidChainIdAndHandler = (
  chainId: ChainId,
  handler: Handler
): boolean => {
  return NETWORK_HANDLERS[chainId].includes(handler);
};

export const isFlashbotsCompatibleChainId = (chainId: ChainId): boolean => {
  return chainId == CHAIN_ID.MAINNET || chainId == CHAIN_ID.GOERLI;
};

export const isETHOrWETH = (
  tokenAddress: string,
  chainID: ChainId
): boolean => {
  const WETH_ADDRESS = NATIVE_WRAPPED_TOKEN_ADDRESS[chainID];
  return (
    tokenAddress.toLowerCase() === ETH_ADDRESS.toLowerCase() ||
    tokenAddress.toLowerCase() === WETH_ADDRESS.toLowerCase()
  );
};

export class GelatoBase {
  public _chainId: ChainId;
  public _provider: Provider | undefined;
  public _signer: Signer | undefined;
  public _gelatoCore: GelatoBaseContract;
  public _erc20OrderRouter: ERC20OrderRouter;
  public _moduleAddress: string;
  public _subgraphUrl: string;
  public _abiEncoder: utils.AbiCoder;
  public _handlerAddress?: string;
  public _handler?: Handler;

  public static slippageBPS: number;
  public static gelatoFeeBPS: number;

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

  get handler(): Handler | undefined {
    return this._handler;
  }

  get handlerAddress(): string | undefined {
    return this._handlerAddress;
  }

  get moduleAddress(): string {
    return this._moduleAddress;
  }

  get contract(): GelatoBaseContract {
    return this._gelatoCore;
  }

  get erc20OrderRouter(): ERC20OrderRouter {
    return this._erc20OrderRouter;
  }

  get abiEncoder(): any {
    return this._abiEncoder;
  }

  constructor(
    chainId: ChainId,
    moduleAddress: string,
    signerOrProvider?: Signer | Provider,
    handler?: Handler,
    handlerAddress?: string
  ) {
    if (handler && !isValidChainIdAndHandler(chainId, handler)) {
      throw new Error("Invalid chainId and handler");
    }

    this._chainId = chainId;
    GelatoBase.gelatoFeeBPS = isEthereumChain(chainId)
      ? 0
      : L2_BPS_GELATO_FEE[chainId];
    GelatoBase.slippageBPS = STOP_LIMIT_SLIPPAGE_BPS[chainId];
    this._subgraphUrl = SUBGRAPH_URL[chainId];
    this._signer = Signer.isSigner(signerOrProvider)
      ? signerOrProvider
      : undefined;
    this._provider = Provider.isProvider(signerOrProvider)
      ? signerOrProvider
      : Signer.isSigner(signerOrProvider)
        ? signerOrProvider.provider
        : undefined;

    this._gelatoCore = this._signer
      ? GelatoBase__factory.connect(
        GELATO_LIMIT_ORDERS_ADDRESS[this._chainId],
        this._signer
      )
      : this._provider
        ? GelatoBase__factory.connect(
          GELATO_LIMIT_ORDERS_ADDRESS[this._chainId],
          this._provider
        )
        : (new Contract(
          GELATO_LIMIT_ORDERS_ADDRESS[this._chainId],
          GelatoBase__factory.createInterface()
        ) as GelatoBaseContract);

    this._abiEncoder = new utils.AbiCoder();

    this._erc20OrderRouter = this._signer
      ? ERC20OrderRouter__factory.connect(
        GELATO_LIMIT_ORDERS_ERC20_ORDER_ROUTER[this._chainId],
        this._signer
      )
      : this._provider
        ? ERC20OrderRouter__factory.connect(
          GELATO_LIMIT_ORDERS_ERC20_ORDER_ROUTER[this._chainId],
          this._provider
        )
        : (new Contract(
          GELATO_LIMIT_ORDERS_ERC20_ORDER_ROUTER[this._chainId],
          ERC20OrderRouter__factory.createInterface()
        ) as ERC20OrderRouter);
    this._handler = handler;
    this._handlerAddress = handlerAddress;
    this._moduleAddress = moduleAddress;
  }

  public async encodeLimitOrderCancellation(
    order: StopLimitOrder,
    checkIsActiveOrder?: boolean
  ): Promise<TransactionData> {
    if (!this._gelatoCore) throw new Error("No gelato limit orders contract");

    if (!order.inputToken) throw new Error("No input token in order");
    if (!order.witness) throw new Error("No witness in order");
    if (!order.outputToken) throw new Error("No output token in order");
    if (!order.minReturn) throw new Error("No minReturn in order");
    if (!order.owner) throw new Error("No owner");

    if (checkIsActiveOrder) {
      const isActiveOrder = await this.isActiveOrder(order);
      if (!isActiveOrder)
        throw new Error("Order not found. Please review your order data.");
    }

    const data = this._gelatoCore.interface.encodeFunctionData("cancelOrder", [
      this._moduleAddress,
      order.inputToken,
      order.owner,
      order.witness,
      order.data,
    ]);

    return {
      data,
      to: this._gelatoCore.address,
      value: constants.Zero,
    };
  }

  public async cancelStopLimitOrder(
    order: StopLimitOrder,
    checkIsActiveOrder?: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (!this._signer) throw new Error("No signer");
    if (!this._gelatoCore) throw new Error("No gelato limit orders contract");

    if (!order.inputToken) throw new Error("No input token in order");
    if (!order.witness) throw new Error("No witness in order");
    if (!order.outputToken) throw new Error("No output token in order");
    if (!order.minReturn) throw new Error("No minReturn in order");
    if (!order.data) throw new Error("No data in order");

    if (checkIsActiveOrder) {
      const isActiveOrder = await this.isActiveOrder(order);
      if (!isActiveOrder)
        throw new Error("Order not found. Please review your order data.");
    }

    const owner = await this._signer.getAddress();

    if (owner.toLowerCase() !== order.owner.toLowerCase())
      throw new Error("Owner and signer mismatch");

    return this._gelatoCore.cancelOrder(
      this._moduleAddress,
      order.inputToken,
      order.owner,
      order.witness,
      order.data,
      overrides ?? {
        gasLimit: isEthereumChain(this._chainId) ? 500000 : 1500000,
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
        this._erc20OrderRouter.address,
        amount,
        overrides
      )
      : ERC20__factory.connect(inputToken, this._signer).approve(
        this._erc20OrderRouter.address,
        amount
      );
  }

  public async isActiveOrder(order: StopLimitOrder): Promise<boolean> {
    if (!this._provider) throw new Error("No provider");
    if (!this._gelatoCore) throw new Error("No gelato limit orders contract");

    if (!order.module) throw new Error("No module in order");
    if (!order.inputToken) throw new Error("No input token in order");
    if (!order.owner) throw new Error("No owner in order");
    if (!order.witness) throw new Error("No witness in order");
    if (!order.data) throw new Error("No data in order");

    return this._gelatoCore.existOrder(
      order.module,
      order.inputToken,
      order.owner,
      order.witness,
      order.data
    );
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

    const gelatoFee = isEthereumChain(this._chainId)
      ? 0
      : BigNumber.from(outputAmount).mul(GelatoBase.gelatoFeeBPS).div(10000).gte(1)
        ? BigNumber.from(outputAmount).mul(GelatoBase.gelatoFeeBPS).div(10000)
        : BigNumber.from(1);

    const slippageBPS = extraSlippageBPS ? extraSlippageBPS : GelatoBase.slippageBPS;

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
    if (isEthereumChain(this._chainId))
      throw new Error("Method not available for current chain.");

    const gelatoFee = BigNumber.from(GelatoBase.gelatoFeeBPS);

    const slippage = extraSlippageBPS
      ? BigNumber.from(extraSlippageBPS)
      : BigNumber.from(GelatoBase.slippageBPS);

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

  public async getPastStopLimitOrders(
    owner: string
  ): Promise<StopLimitOrder[]> {
    const orders = await queryPastOrders(owner, this._chainId);
    return orders;
  }

  public _getKey(order: StopLimitOrder): string {
    return utils.keccak256(
      this._abiEncoder.encode(
        ["address", "address", "address", "address", "bytes"],
        [order.module, order.inputToken, order.owner, order.witness, order.data]
      )
    );
  }
}
