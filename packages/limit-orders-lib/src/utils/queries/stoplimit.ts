import { request } from "graphql-request";
import {
  SUBGRAPH_URL,
  GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS,
  MAX_LIFETIME_IN_SECONDS,
} from "../../constants";
import { StopLimitOrder } from "../../types";
import { GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER } from "./constants";

export const queryStopLimitOrders = async (
  owner: string,
  chainId: number
): Promise<StopLimitOrder[]> => {
  try {
    const dataStopLimitSubgraph = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithExpiry(orders);
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
    const dataStopLimitSubgraph = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithExpiry(orders).filter(
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
    const dataStopLimitSubgraph = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithExpiry(orders).filter(
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
    const dataStopLimitSubgraph = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithExpiry(orders).filter(
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
    const dataStopLimitSubgraph = SUBGRAPH_URL[chainId]
      ? await request(
          SUBGRAPH_URL[chainId],
          GET_ALL_STOP_LIMIT_ORDERS_BY_OWNER,
          {
            owner: owner.toLowerCase(),
            module:
              GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase(),
          }
        )
      : { orders: [] };

    const orders = dataStopLimitSubgraph.orders;

    return _getUniqueOrdersWithExpiry(orders).filter(
      (order) => order.status !== "open"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for past orders");
  }
};

export const _getUniqueOrdersWithExpiry = (
  allOrders: StopLimitOrder[]
): StopLimitOrder[] =>
  [...new Map(allOrders.map((order) => [order.id, order])).values()]
    // sort by `updatedAt` asc so that the most recent one will be used
    .sort((a, b) => parseFloat(a.updatedAt) - parseFloat(b.updatedAt))
    // add expiry to order obj
    .map((order) => {
      const isExpired: boolean =
        Date.now() >
        (parseInt(order.createdAt) + MAX_LIFETIME_IN_SECONDS) * 1000;
      return {
        ...order,
        isExpired,
      };
    });
