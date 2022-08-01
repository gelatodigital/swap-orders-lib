import { request } from "graphql-request";
import { SUBGRAPH_URL } from "../../constants";
import {
  GET_RANGE_ORDER_BY_TOKEN_ID,
  GET_OPEN_RANGE_ORDER_BY_RECEIVER,
  GET_EXECUTED_RANGE_ORDER_BY_RECEIVER,
  GET_CANCELLED_RANGE_ORDER_BY_RECEIVER,
  GET_EXPIRED_RANGE_ORDER_BY_RECEIVER,
} from "./constants";
import { ChainId, RangeOrderData } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";

export const queryRangeOrder = async (
  chainId: ChainId,
  tokenId: BigNumber
): Promise<RangeOrderData> => {
  try {
    const result = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_RANGE_ORDER_BY_TOKEN_ID, {
          tokenId,
        })
      : { orders: [] };

    return result.rangeOrders[0];
  } catch (error) {
    console.log(error);
    throw new Error("Could not query subgraph for Range Order");
  }
};

export const queryOpenRangeOrderByUser = async (
  chainId: ChainId,
  receiver: string
): Promise<RangeOrderData[]> => {
  try {
    const result = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_OPEN_RANGE_ORDER_BY_RECEIVER, {
          receiver,
        })
      : { orders: [] };

    return result.rangeOrders;
  } catch (error) {
    console.log(error);
    throw new Error("Could not query subgraph for Range Order");
  }
};

export const queryExecutedRangeOrderByUser = async (
  chainId: ChainId,
  receiver: string
): Promise<RangeOrderData[]> => {
  try {
    const result = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_EXECUTED_RANGE_ORDER_BY_RECEIVER,
          {
            receiver,
          }
        )
      : { orders: [] };

    return result.rangeOrders;
  } catch (error) {
    console.log(error);
    throw new Error("Could not query subgraph for Range Order");
  }
};

export const queryCancelledRangeOrderByUser = async (
  chainId: ChainId,
  receiver: string
): Promise<RangeOrderData[]> => {
  try {
    const result = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_CANCELLED_RANGE_ORDER_BY_RECEIVER,
          {
            receiver,
          }
        )
      : { orders: [] };

    return result.rangeOrders;
  } catch (error) {
    console.log(error);
    throw new Error("Could not query subgraph for Range Order");
  }
};

export const queryExpiredRangeOrderByUser = async (
  chainId: ChainId,
  receiver: string
): Promise<RangeOrderData[]> => {
  try {
    const result = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_EXPIRED_RANGE_ORDER_BY_RECEIVER,
          {
            receiver,
          }
        )
      : { orders: [] };

    return result.rangeOrders;
  } catch (error) {
    console.log(error);
    throw new Error("Could not query subgraph for Range Order");
  }
};
