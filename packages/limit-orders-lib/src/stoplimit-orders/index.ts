import {
  BigNumber,
  utils,
  ContractTransaction,
  BigNumberish,
  Wallet,
  Overrides,
} from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import {
  GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS,
  HANDLERS_ADDRESSES,
  NETWORK_STOP_LIMIT_HANDLERS,
} from "../constants";
import {
  Handler,
  ChainId,
  StopLimitOrder,
  TransactionData,
  TransactionDataWithSecret,
} from "../types";
import { isValidChainIdAndHandler, GelatoBase } from "./core";
import {
  queryStopLimitOrders,
  queryStopLimitExecutedOrders,
  queryStopLimitCancelledOrders,
  queryPastOrders,
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

    const sotplossHandlers = NETWORK_STOP_LIMIT_HANDLERS[chainId];

    if (!handler) {
      throw new Error("No Handler defined");
    }

    if (handler && !sotplossHandlers.includes(handler)) {
      throw new Error("Handler not supported");
    }

    const moduleAddress = GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId];

    if (!moduleAddress) throw new Error("Invalid chainId and handler");

    const handlerAddress = HANDLERS_ADDRESSES[chainId][handler]?.toLowerCase();
    super(chainId, moduleAddress, signerOrProvider, handler, handlerAddress);
  }

  public async submitStopLimitOrder(
    inputToken: string,
    outputToken: string,
    inputAmount: BigNumberish,
    maxReturn: BigNumberish,
    checkAllowance = true,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (!this.signer) throw new Error("No signer");

    if (!maxReturn) throw new Error("No StopLimit defined");

    const owner = await this.signer.getAddress();

    const txData = await this.encodeStopLimitOrderSubmission(
      inputToken,
      outputToken,
      inputAmount,
      maxReturn,
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
    owner: string,
    checkAllowance = true
  ): Promise<TransactionData> {
    const { payload } = await this.encodeStopLimitOrderSubmissionWithSecret(
      inputToken,
      outputToken,
      inputAmount,
      maxReturn,
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
    owner: string,
    checkAllowance = true
  ): Promise<TransactionDataWithSecret> {
    if (!maxReturnToBeParsed) throw new Error("No StopLimit defined");

    if (!this.handlerAddress) throw new Error("No handlerAddress");

    const randomSecret = utils.hexlify(utils.randomBytes(19)).replace("0x", "");
    // 0x67656c61746f6e6574776f726b = gelatonetwork in hex
    const fullSecret = `0x67656c61746f6e6574776f726b${randomSecret}`;

    const { privateKey: secret, address: witness } = new Wallet(fullSecret);

    const { minReturn } =
      this.getFeeAndSlippageAdjustedMinReturn(maxReturnToBeParsed);

    const payload = await this._encodeSubmitData(
      inputToken,
      outputToken,
      owner,
      witness,
      inputAmount,
      maxReturnToBeParsed,
      minReturn,
      secret,
      checkAllowance
    );

    const encodedData = this.abiEncoder.encode(
      ["address", "uint256", "address", "uint256"],
      [outputToken, minReturn, this.handlerAddress, maxReturnToBeParsed]
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
        maxReturn: maxReturnToBeParsed.toString(),
        adjustedMinReturn: maxReturnToBeParsed.toString(),
        inputData: payload.data.toString(),
        secret: secret.toLowerCase(),
        handler: this.handlerAddress ?? null,
      },
    };
  }

  public async getOpenStopLimitOrders(
    owner: string
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitOrders(owner, this.chainId);
    return orders;
  }

  public async getStopLimitOrders(owner: string): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitOrders(owner, this.chainId);
    return orders;
  }

  public async getExecutedStopLimitOrders(
    owner: string
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitExecutedOrders(owner, this.chainId);
    return orders;
  }

  public async getCancelledStopLimitOrders(
    owner: string
  ): Promise<StopLimitOrder[]> {
    const orders = await queryStopLimitCancelledOrders(owner, this.chainId);
    return orders;
  }

  public async getPastStopLimitOrders(
    owner: string
  ): Promise<StopLimitOrder[]> {
    const orders = await queryPastOrders(owner, this.chainId);
    return orders;
  }
}
