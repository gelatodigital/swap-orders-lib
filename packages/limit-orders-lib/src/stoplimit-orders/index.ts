import {
  BigNumber,
  constants,
  utils,
  ContractTransaction,
  BigNumberish,
  Wallet,
  Overrides,
} from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import {
  ETH_ADDRESS,
  GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS,
  HANDLERS_ADDRESSES,
} from "../constants";
import { ERC20__factory } from "../contracts/types";

import {
  Handler,
  ChainId,
  StopLimitOrder,
  TransactionData,
  TransactionDataWithSecret,
} from "../types";
import { isEthereumChain, isNetworkGasToken } from "../utils";
import { isValidChainIdAndHandler, GelatoBase } from "./core";
import {
  queryStopLimitOrders,
  queryStopLimitExecutedOrders,
  queryStopLimitCancelledOrders,
} from "../utils/queries/stoplimit";

export class GelatoStopLimitOrders extends GelatoBase {
  constructor(
    chainId: ChainId,
    signerOrProvider?: Signer | Provider,
    handler?: Handler
  ) {
    if (handler && !isValidChainIdAndHandler(chainId, handler)) {
      throw new Error("Invalid chainId and handler");
    }
    const sotplossHandlers = ["quickswap_stoploss"];

    if (handler && !sotplossHandlers.includes(handler)) {
      throw new Error("Wrong handler");
    }

    const moduleAddress = GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS[chainId];

    if (!moduleAddress) throw new Error("Invalid chainId and handler");

    const handlerAddress =
      handler === "quickswap_stoploss"
        ? HANDLERS_ADDRESSES[chainId][handler]?.toLowerCase()
        : undefined;
    super(chainId, moduleAddress, signerOrProvider, handler, handlerAddress);
  }

  public async submitStopLimitOrder(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturn: BigNumberish,
    userSlippage: number,
    checkAllowance = true,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (!this.signer) throw new Error("No signer");

    if (!maxReturn) throw new Error("No StopLimit defined");

    if (!userSlippage) throw new Error("No slippage defined");

    const owner = await this.signer.getAddress();

    const txData = await this.encodeStopLimitOrderSubmission(
      inputToken,
      outputToken,
      inputAmount,
      maxReturn,
      userSlippage,
      owner,
      checkAllowance
    );

    return this.signer.sendTransaction({
      ...overrides,
      to: txData.to,
      data: txData.data,
      value: BigNumber.from(txData.value),
    });
  }

  public async encodeStopLimitOrderSubmission(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturn: BigNumberish,
    userSlippage: number,
    owner: string,
    checkAllowance = true
  ): Promise<TransactionData> {
    const { payload } = await this.encodeStopLimitOrderSubmissionWithSecret(
      inputToken,
      outputToken,
      inputAmount,
      maxReturn,
      userSlippage,
      owner,
      checkAllowance
    );

    return payload;
  }

  public async encodeStopLimitOrderSubmissionWithSecret(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturnToBeParsed: BigNumberish,
    userSlippage: number,
    owner: string,
    checkAllowance = true
  ): Promise<TransactionDataWithSecret> {
    if (!maxReturnToBeParsed) throw new Error("No StopLimit defined");

    if (!userSlippage) throw new Error("No slippage defined");

    const randomSecret = utils.hexlify(utils.randomBytes(19)).replace("0x", "");
    // 0x67656c61746f6e6574776f726b = gelatonetwork in hex
    const fullSecret = `0x67656c61746f6e6574776f726b${randomSecret}`;

    const { privateKey: secret, address: witness } = new Wallet(fullSecret);

    const { minReturn: maxReturn } = !isEthereumChain(this.chainId)
      ? this.getFeeAndSlippageAdjustedMinReturn(maxReturnToBeParsed)
      : { minReturn: maxReturnToBeParsed };

    const { minReturn } = this.getFeeAndSlippageAdjustedMinReturn(
      maxReturnToBeParsed,
      userSlippage
    );

    const payload = await this._encodeSubmitData(
      inputToken,
      outputToken,
      owner,
      witness,
      inputAmount,
      maxReturn,
      minReturn,
      secret,
      checkAllowance
    );

    const encodedData = this.handlerAddress
      ? this.abiEncoder.encode(
        ["address", "uint256", "address", "uint256"],
        [outputToken, minReturn, this.handlerAddress, maxReturn]
      )
      : this.abiEncoder.encode(
        ["address", "uint256", "address", "uint256"],
        [outputToken, minReturn, "", maxReturn]
      );

    return {
      payload,
      secret,
      witness,
      order: {
        id: this._getKey({
          module: this.moduleAddress,
          inputToken,
          owner,
          witness,
          data: encodedData,
        } as StopLimitOrder),
        module: this.moduleAddress.toLowerCase(),
        data: encodedData,
        inputToken: inputToken.toLowerCase(),
        outputToken: outputToken.toLowerCase(),
        owner: owner.toLowerCase(),
        witness: witness.toLowerCase(),
        inputAmount: inputAmount.toString(),
        minReturn: minReturn.toString(),
        maxReturn: maxReturn.toString(),
        adjustedMinReturn: maxReturnToBeParsed.toString(),
        inputData: payload.data.toString(),
        secret: secret.toLowerCase(),
        handler: this.handlerAddress ?? null,
      },
    };
  }

  public async _encodeSubmitData(
    inputToken: string,
    outputToken: string,
    owner: string,
    witness: string,
    amount: BigNumberish,
    maxReturn: BigNumberish,
    minReturn: BigNumberish,
    secret: string,
    checkAllowance: boolean
  ): Promise<TransactionData> {
    if (!this.provider) throw new Error("No provider");

    if (inputToken.toLowerCase() === outputToken.toLowerCase())
      throw new Error("Input token and output token can not be equal");

    const encodedData = this.handlerAddress
      ? this.abiEncoder.encode(
        ["address", "uint256", "address", "uint256"],
        [outputToken, minReturn, this.handlerAddress, maxReturn]
      )
      : this.abiEncoder.encode(
        ["address", "uint256", "address", "uint256"],
        [outputToken, minReturn, "", maxReturn]
      );

    let data, value, to;
    if (isNetworkGasToken(inputToken)) {
      const encodedEthOrder = await this.contract.encodeEthOrder(
        this.moduleAddress,
        ETH_ADDRESS, // we also use ETH_ADDRESS if it's MATIC
        owner,
        witness,
        encodedData,
        secret
      );
      data = this.contract.interface.encodeFunctionData("depositEth", [
        encodedEthOrder,
      ]);
      value = amount;
      to = this.contract.address;
    } else {
      if (checkAllowance) {
        const allowance = await ERC20__factory.connect(
          inputToken,
          this.provider
        ).allowance(owner, this.erc20OrderRouter.address);

        if (allowance.lt(amount))
          throw new Error("Insufficient token allowance for placing order");
      }

      data = this.erc20OrderRouter.interface.encodeFunctionData(
        "depositToken",
        [
          amount,
          this.moduleAddress,
          inputToken,
          owner,
          witness,
          encodedData,
          secret,
        ]
      );
      value = constants.Zero;
      to = this.erc20OrderRouter.address;
    }

    return { data, value, to };
  }

  public async getOpenOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitOrders(owner, this._chainId);

    return orders
      .map((order) => ({
        ...order,
        adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
      }))
      .filter((order) => {
        if (this._handler && !order.handler) {
          return includeOrdersWithNullHandler ? true : false;
        } else {
          return this._handler ? order.handler === this._handlerAddress : true;
        }
      });
  }

  public async getOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitOrders(owner, this._chainId);

    return orders
      .map((order) => ({
        ...order,
        adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
      }))
      .filter((order) => {
        if (this._handler && !order.handler) {
          return includeOrdersWithNullHandler ? true : false;
        } else {
          return this._handler ? order.handler === this._handlerAddress : true;
        }
      });
  }

  public async getExecutedOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitExecutedOrders(owner, this._chainId);
    return orders
      .map((order) => ({
        ...order,
        adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
      }))
      .filter((order) => {
        if (this._handler && !order.handler) {
          return includeOrdersWithNullHandler ? true : false;
        } else {
          return this._handler ? order.handler === this._handlerAddress : true;
        }
      });
  }

  public async getCancelledOrders(
    owner: string,
    includeOrdersWithNullHandler = false
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitCancelledOrders(owner, this._chainId);
    return orders
      .map((order) => ({
        ...order,
        adjustedMinReturn: this.getAdjustedMinReturn(order.minReturn),
      }))
      .filter((order) => {
        if (this._handler && !order.handler) {
          return includeOrdersWithNullHandler ? true : false;
        } else {
          return this._handler ? order.handler === this._handlerAddress : true;
        }
      });
  }
}
