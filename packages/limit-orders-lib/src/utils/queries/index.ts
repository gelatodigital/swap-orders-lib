import { request } from "graphql-request";
import {
  OLD_SUBGRAPH_URL,
  SUBGRAPH_URL,
  GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS,
  MAX_LIFETIME_IN_SECONDS,
} from "../../constants";
import { Order } from "../../types";
import { GET_ALL_ORDERS_BY_OWNER, GET_ORDER_BY_ID } from "./constants";

const stopLimitModule = (chainId: number) =>
  GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase();

export const queryOrder = async (
  orderId: string,
  chainId: number
): Promise<Order | null> => {
  try {
    const dataFromOldSubgraph = OLD_SUBGRAPH_URL[chainId]
      ? await request(OLD_SUBGRAPH_URL[chainId], GET_ORDER_BY_ID, {
          id: orderId.toLowerCase(),
        })
      : { orders: [] };

    const dataFromNewSubgraph = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_ORDER_BY_ID, {
          id: orderId.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [
      ...dataFromOldSubgraph.orders,
      ...dataFromNewSubgraph.orders,
    ];

    return _getUniqueOrdersWithExpiry(allOrders, chainId).pop() ?? null;
  } catch (error) {
    throw new Error("Could not query subgraph for all orders");
  }
};

export const queryOrders = async (
  owner: string,
  chainId: number
): Promise<Order[]> => {
  try {
    const dataFromOldSubgraph = OLD_SUBGRAPH_URL[chainId]
      ? await request(OLD_SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const dataFromNewSubgraph = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [
      ...dataFromOldSubgraph.orders,
      ...dataFromNewSubgraph.orders,
    ];

    return _getUniqueOrdersWithExpiry(allOrders, chainId);
  } catch (error) {
    throw new Error("Could not query subgraph for all orders");
  }
};

export const queryOpenOrders = async (
  owner: string,
  chainId: number
): Promise<Order[]> => {
  try {
    const dataFromOldSubgraph = OLD_SUBGRAPH_URL[chainId]
      ? await request(OLD_SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const dataFromNewSubgraph = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [
      ...dataFromOldSubgraph.orders,
      ...dataFromNewSubgraph.orders,
    ];

    return _getUniqueOrdersWithExpiry(allOrders, chainId).filter(
      (order) => order.status === "open"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for open orders");
  }
};

export const queryPastOrders = async (
  owner: string,
  chainId: number
): Promise<Order[]> => {
  try {
    const dataFromOldSubgraph = OLD_SUBGRAPH_URL[chainId]
      ? await request(OLD_SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const dataFromNewSubgraph = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [
      ...dataFromOldSubgraph.orders,
      ...dataFromNewSubgraph.orders,
    ];

    return _getUniqueOrdersWithExpiry(allOrders, chainId).filter(
      (order) => order.status !== "open"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for past orders");
  }
};

export const queryExecutedOrders = async (
  owner: string,
  chainId: number
): Promise<Order[]> => {
  try {
    const dataFromOldSubgraph = OLD_SUBGRAPH_URL[chainId]
      ? await request(OLD_SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const dataFromNewSubgraph = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [
      ...dataFromOldSubgraph.orders,
      ...dataFromNewSubgraph.orders,
    ];

    return _getUniqueOrdersWithExpiry(allOrders, chainId).filter(
      (order) => order.status === "executed"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for executed orders");
  }
};

export const queryCancelledOrders = async (
  owner: string,
  chainId: number
): Promise<Order[]> => {
  try {
    const dataFromOldSubgraph = OLD_SUBGRAPH_URL[chainId]
      ? await request(OLD_SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const dataFromNewSubgraph = SUBGRAPH_URL[chainId]
      ? await request(SUBGRAPH_URL[chainId], GET_ALL_ORDERS_BY_OWNER, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [
      ...dataFromOldSubgraph.orders,
      ...dataFromNewSubgraph.orders,
    ];

    return _getUniqueOrdersWithExpiry(allOrders, chainId).filter(
      (order) => order.status === "cancelled"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for cancelled orders");
  }
};

const _getUniqueOrdersWithExpiry = (
  allOrders: Order[],
  chainId: number
): Order[] =>
  // create Map and asign order id to order (key:value) to avoid having duplicated orders form multiple subgraphs
  [...new Map(allOrders.map((order) => [order.id, order])).values()]
    // sort by `updatedAt` asc so that the most recent one will be used
    .sort((a, b) => parseFloat(a.updatedAt) - parseFloat(b.updatedAt))
    // filter out stop limit module
    .filter((order) => order.module !== stopLimitModule(chainId))
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
