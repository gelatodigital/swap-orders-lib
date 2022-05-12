/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface IGelatoUniswapV2OrdersInterface extends ethers.utils.Interface {
  functions: {
    "canFill(uint256,(address,address,address,address,address,uint256,uint256,uint256,bytes32,bytes),bytes)": FunctionFragment;
    "cancelOrder((address,address,address,address,address,uint256,uint256,uint256,bytes32,bytes))": FunctionFragment;
    "depositNative((address,address,address,address,address,uint256,uint256,uint256,bytes32,bytes))": FunctionFragment;
    "depositToken((address,address,address,address,address,uint256,uint256,uint256,bytes32,bytes))": FunctionFragment;
    "fill((address,address,address,address,address,uint256,uint256,uint256,bytes32,bytes),bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "canFill",
    values: [
      BigNumberish,
      {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "cancelOrder",
    values: [
      {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositNative",
    values: [
      {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositToken",
    values: [
      {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "fill",
    values: [
      {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      BytesLike
    ]
  ): string;

  decodeFunctionResult(functionFragment: "canFill", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "cancelOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositNative",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fill", data: BytesLike): Result;

  events: {};
}

export class IGelatoUniswapV2Orders extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IGelatoUniswapV2OrdersInterface;

  functions: {
    canFill(
      _minReturn: BigNumberish,
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    cancelOrder(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositNative(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositToken(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fill(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  canFill(
    _minReturn: BigNumberish,
    _order: {
      owner: string;
      inputToken: string;
      outputToken: string;
      factory: string;
      router: string;
      amountIn: BigNumberish;
      minReturn: BigNumberish;
      salt: BigNumberish;
      initCodeHash: BytesLike;
      data: BytesLike;
    },
    _auxData: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  cancelOrder(
    _order: {
      owner: string;
      inputToken: string;
      outputToken: string;
      factory: string;
      router: string;
      amountIn: BigNumberish;
      minReturn: BigNumberish;
      salt: BigNumberish;
      initCodeHash: BytesLike;
      data: BytesLike;
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositNative(
    _order: {
      owner: string;
      inputToken: string;
      outputToken: string;
      factory: string;
      router: string;
      amountIn: BigNumberish;
      minReturn: BigNumberish;
      salt: BigNumberish;
      initCodeHash: BytesLike;
      data: BytesLike;
    },
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositToken(
    _order: {
      owner: string;
      inputToken: string;
      outputToken: string;
      factory: string;
      router: string;
      amountIn: BigNumberish;
      minReturn: BigNumberish;
      salt: BigNumberish;
      initCodeHash: BytesLike;
      data: BytesLike;
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fill(
    _order: {
      owner: string;
      inputToken: string;
      outputToken: string;
      factory: string;
      router: string;
      amountIn: BigNumberish;
      minReturn: BigNumberish;
      salt: BigNumberish;
      initCodeHash: BytesLike;
      data: BytesLike;
    },
    _auxData: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    canFill(
      _minReturn: BigNumberish,
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    cancelOrder(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    depositNative(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    depositToken(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    fill(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    canFill(
      _minReturn: BigNumberish,
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    cancelOrder(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositNative(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositToken(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fill(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    canFill(
      _minReturn: BigNumberish,
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    cancelOrder(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositNative(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositToken(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fill(
      _order: {
        owner: string;
        inputToken: string;
        outputToken: string;
        factory: string;
        router: string;
        amountIn: BigNumberish;
        minReturn: BigNumberish;
        salt: BigNumberish;
        initCodeHash: BytesLike;
        data: BytesLike;
      },
      _auxData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
