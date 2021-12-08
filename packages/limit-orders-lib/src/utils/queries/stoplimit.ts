import { request } from "graphql-request";
import {
  STOP_LIMIT_ORDER_SUBGRAPH_URL,
  GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS,
  MAX_LIFETIME,
} from "../../constants";
import { StopLimitOrder } from "../../types";
import { GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER } from "./constants";

export const queryStopLimitOrders = async (
  owner: string,
  chainId: number
): Promise<StopLimitOrder[]> => {
  try {
    const dataStopLimitSubgraph = STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId]
      ? await request(
          STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithHandler(orders);
  } catch (error) {
    console.error(error);
    throw new Error("Could not query subgraph for all orders");
  }
};

export const queryOpenStopLimitOrders = async (
  owner: string,
  chainId: number
): Promise<StopLimitOrder[]> => {
  try {
    const dataStopLimitSubgraph = STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId]
      ? await request(
          STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithHandler(orders).filter(
      (order) => order.status === "open"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for open orders");
  }
};

export const queryStopLimitExecutedOrders = async (
  owner: string,
  chainId: number
): Promise<StopLimitOrder[]> => {
  try {
    const dataStopLimitSubgraph = STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId]
      ? await request(
          STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithHandler(orders).filter(
      (order) => order.status === "executed"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for executed orders");
  }
};

export const queryStopLimitCancelledOrders = async (
  owner: string,
  chainId: number
): Promise<StopLimitOrder[]> => {
  try {
    const dataStopLimitSubgraph = STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId]
      ? await request(
          STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithHandler(orders).filter(
      (order) => order.status === "cancelled"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for cancelled orders");
  }
};

export const queryPastOrders = async (
  owner: string,
  chainId: number
): Promise<StopLimitOrder[]> => {
  try {
    const dataStopLimitSubgraph = STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId]
      ? await request(
          STOP_LIMIT_ORDER_SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOPLOSS_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithHandler(orders).filter(
      (order) => order.status !== "open"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for past orders");
  }
};

const checkExpiration = (allOrders: StopLimitOrder[]): StopLimitOrder[] =>
  allOrders.map((order: StopLimitOrder) => {
    order.isExpired =
      Date.now() < (parseInt(order.createdAt) + MAX_LIFETIME) * 1000;
    return { ...order };
  });

export const _getUniqueOrdersWithHandler = (
  allOrders: StopLimitOrder[]
): StopLimitOrder[] =>
  [
    ...new Map(
      checkExpiration(allOrders).map((order) => [order.id, order])
    ).values(),
  ]
    // sort by `updatedAt` asc so that the most recent one will be used
    .sort((a, b) => parseFloat(a.updatedAt) - parseFloat(b.updatedAt))
    .map((order) => {
      let handler;
      try {
        const hasHandler = order.data.length === 194;
        handler = hasHandler ? "0x" + order.data.substr(154, 194) : null;
      } catch (e) {
        handler = null;
      }

      return { ...order, handler };
    });
