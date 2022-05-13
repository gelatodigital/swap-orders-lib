import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderV2 } from "@gelatonetwork/limit-orders-lib";
import { useWeb3 } from "../../web3";
import {
  clearOrdersLocalStorage,
  getLSOrders,
  saveOrder,
} from "../../utils/localStorageOrders";
import useInterval from "../useInterval";
import { useSelector } from "react-redux";
import { AppState } from "../../state";
import useGelatoLimitOrdersLib from "./useGelatoLimitOrdersLib";

export interface GelatoLimitOrdersHistory {
  open: { pending: OrderV2[]; confirmed: OrderV2[] };
  cancelled: { pending: OrderV2[]; confirmed: OrderV2[] };
  executed: OrderV2[];
  expired: OrderV2[];
  clearLocalStorageAndRefetchDataFromSubgraph: () => void;
}

function newOrdersFirst(a: OrderV2, b: OrderV2) {
  return Number(b.updatedAt) - Number(a.updatedAt);
}

export default function useGelatoLimitOrdersHistory(
  includeOrdersWithNullHandler = false
): GelatoLimitOrdersHistory {
  const { account, chainId } = useWeb3();

  const gelatoLimitOrders = useGelatoLimitOrdersLib();

  const [openOrders, setOpenOrders] = useState<{
    pending: OrderV2[];
    confirmed: OrderV2[];
  }>({ pending: [], confirmed: [] });
  const [cancelledOrders, setCancelledOrders] = useState<{
    pending: OrderV2[];
    confirmed: OrderV2[];
  }>({ pending: [], confirmed: [] });
  const [executedOrders, setExecutedOrders] = useState<OrderV2[]>([]);
  const [expiredOrders, setExpiredOrders] = useState<OrderV2[]>([]);

  const state = useSelector<AppState, AppState["gtransactions"]>(
    (state) => state.gtransactions
  ) as any;

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [
    chainId,
    state,
  ]);

  const fetchOpenOrders = useCallback(() => {
    if (gelatoLimitOrders && account && chainId)
      gelatoLimitOrders
        .getOpenOrders(account.toLowerCase(), includeOrdersWithNullHandler)
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account);

          orders.forEach((order: OrderV2) => {
            const orderExists = ordersLS.find(
              (confOrder) =>
                confOrder.id.toLowerCase() === order.id.toLowerCase()
            );

            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt)) ||
              orderExists.isExpired !== order.isExpired
            ) {
              saveOrder(chainId, account, order);
            }
          });

          const openOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "open"
          );

          setExpiredOrders(
            orders.filter((order) => order.status === "open" && order.isExpired)
          );

          const pendingOrdersLS = getLSOrders(chainId, account, true);

          setOpenOrders({
            confirmed: openOrdersLS
              .filter((order) => !order.isExpired)
              .filter((order: OrderV2) => {
                const orderCancelled = pendingOrdersLS
                  .filter((pendingOrder) => pendingOrder.status === "cancelled")
                  .find(
                    (pendingOrder) =>
                      pendingOrder.id.toLowerCase() === order.id.toLowerCase()
                  );
                return orderCancelled ? false : true;
              })
              .sort(newOrdersFirst),
            pending: pendingOrdersLS
              .filter((order) => order.status === "open")
              .sort(newOrdersFirst),
          });
        })
        .catch((e) => {
          console.error("Error fetching open orders from subgraph", e);
          const openOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "open"
          );

          const pendingOrdersLS = getLSOrders(chainId, account, true);

          setExpiredOrders(
            openOrdersLS.filter(
              (order) => order.status === "open" && order.isExpired
            )
          );

          setOpenOrders({
            confirmed: openOrdersLS
              .filter((order) => !order.isExpired)
              .filter((order: OrderV2) => {
                const orderCancelled = pendingOrdersLS
                  .filter((pendingOrder) => pendingOrder.status === "cancelled")
                  .find(
                    (pendingOrder) =>
                      pendingOrder.id.toLowerCase() === order.id.toLowerCase()
                  );
                return orderCancelled ? false : true;
              })
              .sort(newOrdersFirst),
            pending: pendingOrdersLS
              .filter((order) => order.status === "open")
              .sort(newOrdersFirst),
          });
        });
  }, [gelatoLimitOrders, account, chainId, includeOrdersWithNullHandler]);

  const fetchCancelledOrders = useCallback(() => {
    if (gelatoLimitOrders && account && chainId)
      gelatoLimitOrders
        .getCancelledOrders(account.toLowerCase(), includeOrdersWithNullHandler)
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account);

          orders.forEach((order: OrderV2) => {
            const orderExists = ordersLS.find(
              (confOrder) =>
                confOrder.id.toLowerCase() === order.id.toLowerCase()
            );
            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt))
            ) {
              saveOrder(chainId, account, order);
            }
          });

          const cancelledOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "cancelled"
          );

          const pendingCancelledOrdersLS = getLSOrders(
            chainId,
            account,
            true
          ).filter((order) => order.status === "cancelled");

          setCancelledOrders({
            confirmed: cancelledOrdersLS.sort(newOrdersFirst),
            pending: pendingCancelledOrdersLS.sort(newOrdersFirst),
          });
        })
        .catch((e) => {
          console.error("Error fetching cancelled orders from subgraph", e);
          const cancelledOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "cancelled"
          );

          const pendingCancelledOrdersLS = getLSOrders(
            chainId,
            account,
            true
          ).filter((order) => order.status === "cancelled");

          setCancelledOrders({
            confirmed: cancelledOrdersLS.sort(newOrdersFirst),
            pending: pendingCancelledOrdersLS.sort(newOrdersFirst),
          });
        });
  }, [gelatoLimitOrders, account, chainId, includeOrdersWithNullHandler]);

  const fetchExecutedOrders = useCallback(() => {
    if (gelatoLimitOrders && account && chainId)
      gelatoLimitOrders
        .getExecutedOrders(account.toLowerCase(), includeOrdersWithNullHandler)
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account);

          orders.forEach((order: OrderV2) => {
            const orderExists = ordersLS.find(
              (confOrder) =>
                confOrder.id.toLowerCase() === order.id.toLowerCase()
            );
            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt))
            ) {
              saveOrder(chainId, account, order);
            }
          });

          const executedOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "executed"
          );

          setExecutedOrders(executedOrdersLS.sort(newOrdersFirst));
        })
        .catch((e) => {
          console.error("Error fetching executed orders from subgraph", e);
          const executedOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "executed"
          );

          setExecutedOrders(executedOrdersLS.sort(newOrdersFirst));
        });
  }, [gelatoLimitOrders, account, chainId, includeOrdersWithNullHandler]);

  const clearLocalStorageAndRefetchDataFromSubgraph = useCallback(() => {
    clearOrdersLocalStorage();

    setExecutedOrders([]);
    setCancelledOrders({
      confirmed: [],
      pending: [],
    });

    setOpenOrders({
      confirmed: [],
      pending: [],
    });

    fetchOpenOrders();
    fetchCancelledOrders();
    fetchExecutedOrders();
  }, [fetchCancelledOrders, fetchExecutedOrders, fetchOpenOrders]);

  useEffect(() => {
    fetchOpenOrders();
    fetchCancelledOrders();
    fetchExecutedOrders();
  }, [
    fetchCancelledOrders,
    fetchExecutedOrders,
    fetchOpenOrders,
    transactions,
  ]);

  useInterval(fetchOpenOrders, 120_000);
  useInterval(fetchCancelledOrders, 120_000);
  useInterval(fetchExecutedOrders, 120_000);

  return {
    open: openOrders,
    cancelled: cancelledOrders,
    executed: executedOrders,
    expired: expiredOrders,
    clearLocalStorageAndRefetchDataFromSubgraph,
  };
}
