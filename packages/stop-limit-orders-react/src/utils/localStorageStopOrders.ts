import { StopLimitOrder, constants } from "@gelatonetwork/limit-orders-lib";
import { get, set, clear } from "local-storage";

const LS_STOP_ORDERS = "gstoplimit_";
const { GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS } = constants;

export function clearOrdersLocalStorage() {
  return clear();
}

export function lsStopKey(key: string, account: string, chainId: number) {
  return key + account.toString() + chainId.toString();
}

export function getLSOrders(chainId: number, account: string, pending = false) {
  const key = pending
    ? lsStopKey(LS_STOP_ORDERS + "pending_", account, chainId)
    : lsStopKey(LS_STOP_ORDERS, account, chainId);

  const orders = get<StopLimitOrder[]>(key);

  return orders ? getUniqueOrders(orders) : [];
}

export function saveStopOrder(
  chainId: number,
  account: string,
  order: StopLimitOrder,
  pending = false
) {
  if (
    order.module !==
    GELATO_STOP_LIMIT_ORDERS_MODULE_ADDRESS[chainId].toLowerCase()
  )
    return;
  const key = pending
    ? lsStopKey(LS_STOP_ORDERS + "pending_", account, chainId)
    : lsStopKey(LS_STOP_ORDERS, account, chainId);

  if (!pending) {
    removeOrder(chainId, account, order, true);
  }

  const orders = removeOrder(chainId, account, order, pending);

  if (!orders.length) {
    set(key, [order]);
  } else {
    orders.push(order);
    set(key, orders);
  }
}

export function removeOrder(
  chainId: number,
  account: string,
  order: StopLimitOrder,
  pending = false
) {
  const key = pending
    ? lsStopKey(LS_STOP_ORDERS + "pending_", account, chainId)
    : lsStopKey(LS_STOP_ORDERS, account, chainId);

  const prev = get<StopLimitOrder[]>(key);

  if (!prev) return [];

  const orders = prev.filter(
    (orderInLS) => orderInLS.id.toLowerCase() !== order.id.toLowerCase()
  );

  set(key, orders);

  return orders;
}

export function confirmOrderCancellation(
  chainId: number,
  account: string,
  cancellationHash: string,
  success = true
) {
  const cancelHash = cancellationHash.toLowerCase();
  const pendingKey = lsStopKey(LS_STOP_ORDERS + "pending_", account, chainId);
  const pendingOrders = get<StopLimitOrder[]>(pendingKey);
  const confirmedOrder = pendingOrders.find(
    (order) => order.cancelledTxHash?.toLowerCase() === cancelHash
  );

  if (confirmedOrder) removeOrder(chainId, account, confirmedOrder, true);

  if (success && confirmedOrder) {
    const ordersKey = lsStopKey(LS_STOP_ORDERS, account, chainId);
    const orders = get<StopLimitOrder[]>(ordersKey);
    if (orders) {
      const ordersToSave = removeOrder(chainId, account, confirmedOrder);
      ordersToSave.push({
        ...confirmedOrder,
        cancelledTxHash: cancelHash,
      });
      set(ordersKey, ordersToSave);
    } else {
      set(ordersKey, [
        {
          ...confirmedOrder,
          cancelledTxHash: cancelHash,
        },
      ]);
    }
  }
}

export function confirmOrderSubmission(
  chainId: number,
  account: string,
  submissionHash: string,
  success = true
) {
  const creationHash = submissionHash.toLowerCase();
  const pendingKey = lsStopKey(LS_STOP_ORDERS + "pending_", account, chainId);
  const pendingOrders = get<StopLimitOrder[]>(pendingKey);
  const confirmedOrder = pendingOrders.find(
    (order) => order.createdTxHash?.toLowerCase() === creationHash
  );

  if (confirmedOrder) removeOrder(chainId, account, confirmedOrder, true);

  if (success && confirmedOrder) {
    const ordersKey = lsStopKey(LS_STOP_ORDERS, account, chainId);
    const orders = get<StopLimitOrder[]>(ordersKey);
    if (orders) {
      const ordersToSave = removeOrder(chainId, account, {
        ...confirmedOrder,
        createdTxHash: creationHash,
      });
      ordersToSave.push({
        ...confirmedOrder,
        createdTxHash: creationHash,
      });
      set(ordersKey, ordersToSave);
    } else {
      set(ordersKey, [
        {
          ...confirmedOrder,
          createdTxHash: creationHash,
        },
      ]);
    }
  }
}

export const getUniqueOrders = (
  allOrders: StopLimitOrder[]
): StopLimitOrder[] => [
  ...new Map(
    allOrders
      // sort by `updatedAt` asc so that the most recent one will be used
      .sort((a, b) => parseFloat(a.updatedAt) - parseFloat(b.updatedAt))
      .map((order) => [order.id, order])
  ).values(),
];
