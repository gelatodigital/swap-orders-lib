import { request } from "graphql-request";
import {
  OLD_SUBGRAPH_URL,
  SUBGRAPH_URL_V2,
  SUBGRAPH_URL,
  GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS,
  MAX_LIFETIME_IN_SECONDS,
} from "../../constants";
import { Order, OrderV2 } from "../../types";
import {
  GET_ALL_ORDERS_BY_OWNER,
  GET_ORDER_BY_ID,
  GET_ORDER_BY_ID_V2,
  GET_ALL_ORDERS_BY_OWNER_V2,
} from "./constants";

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

export const queryOrderV2 = async (
  orderId: string,
  chainId: number
): Promise<OrderV2 | null> => {
  try {
    const dataFromSubgraph = SUBGRAPH_URL_V2[chainId]
      ? await request(SUBGRAPH_URL_V2[chainId], GET_ORDER_BY_ID_V2, {
          id: orderId.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [...dataFromSubgraph.orders];

    return _getUniqueOrdersV2WithExpiry(allOrders, chainId).pop() ?? null;
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

export const queryOrdersV2 = async (
  owner: string,
  chainId: number
): Promise<OrderV2[]> => {
  try {
    const dataFromSubgraph = SUBGRAPH_URL_V2[chainId]
      ? await request(SUBGRAPH_URL_V2[chainId], GET_ALL_ORDERS_BY_OWNER_V2, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [...dataFromSubgraph.orders];

    return _getUniqueOrdersV2WithExpiry(allOrders, chainId);
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

export const queryOpenOrdersV2 = async (
  owner: string,
  chainId: number
): Promise<OrderV2[]> => {
  try {
    const dataFromSubgraph = SUBGRAPH_URL_V2[chainId]
      ? await request(SUBGRAPH_URL_V2[chainId], GET_ALL_ORDERS_BY_OWNER_V2, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [...dataFromSubgraph.orders];

    return _getUniqueOrdersV2WithExpiry(allOrders, chainId).filter(
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

export const queryPastOrdersV2 = async (
  owner: string,
  chainId: number
): Promise<OrderV2[]> => {
  try {
    const dataFromSubgraph = SUBGRAPH_URL_V2[chainId]
      ? await request(SUBGRAPH_URL_V2[chainId], GET_ALL_ORDERS_BY_OWNER_V2, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [...dataFromSubgraph.orders];

    return _getUniqueOrdersV2WithExpiry(allOrders, chainId).filter(
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

export const queryExecutedOrdersV2 = async (
  owner: string,
  chainId: number
): Promise<OrderV2[]> => {
  try {
    const dataFromSubgraph = SUBGRAPH_URL_V2[chainId]
      ? await request(SUBGRAPH_URL_V2[chainId], GET_ALL_ORDERS_BY_OWNER_V2, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [...dataFromSubgraph.orders];

    return _getUniqueOrdersV2WithExpiry(allOrders, chainId).filter(
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

export const queryCancelledOrdersV2 = async (
  owner: string,
  chainId: number
): Promise<OrderV2[]> => {
  try {
    const dataFromSubgraph = SUBGRAPH_URL_V2[chainId]
      ? await request(SUBGRAPH_URL_V2[chainId], GET_ALL_ORDERS_BY_OWNER_V2, {
          owner: owner.toLowerCase(),
        })
      : { orders: [] };

    const allOrders = [...dataFromSubgraph.orders];

    return _getUniqueOrdersV2WithExpiry(allOrders, chainId).filter(
      (order) => order.status === "cancelled"
    );
  } catch (error) {
    throw new Error("Could not query subgraph for cancelled orders");
  }
};

const _getUniqueOrdersV2WithExpiry = (
  allOrders: OrderV2[],
  chainId: number
): OrderV2[] =>
  // create Map and asign order id to order (key:value) to avoid having duplicated orders form multiple subgraphs
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
