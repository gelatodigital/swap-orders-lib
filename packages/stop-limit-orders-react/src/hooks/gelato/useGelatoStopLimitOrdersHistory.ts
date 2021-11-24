import { useCallback, useEffect, useMemo, useState } from "react";
import { StopLimitOrder } from "@gelatonetwork/limit-orders-lib";
import { useWeb3 } from "../../web3";
import { getLSOrders, saveOrder } from "../../utils/localStorageOrders";
import useInterval from "../useInterval";
import { useSelector } from "react-redux";
import { AppState } from "../../state";
import useGelatoStopLimitOrdersLib from "./useGelatoStopLimitOrdersLib";

export interface GelatoStopLimitOrdersHistory {
  open: { pending: StopLimitOrder[]; confirmed: StopLimitOrder[] };
  cancelled: { pending: StopLimitOrder[]; confirmed: StopLimitOrder[] };
  executed: StopLimitOrder[];
}
function newOrdersFirst(a: StopLimitOrder, b: StopLimitOrder) {
  return Number(b.updatedAt) - Number(a.updatedAt);
}

export default function useGelatoStopLimitOrdersHistory(
  includeOrdersWithNullHandler = false
): GelatoStopLimitOrdersHistory {
  const { account, chainId } = useWeb3();

  const gelatoLimitOrders = useGelatoStopLimitOrdersLib();

  const [openOrders, setOpenOrders] = useState<{
    pending: StopLimitOrder[];
    confirmed: StopLimitOrder[];
  }>({ pending: [], confirmed: [] });
  const [cancelledOrders, setCancelledOrders] = useState<{
    pending: StopLimitOrder[];
    confirmed: StopLimitOrder[];
  }>({ pending: [], confirmed: [] });
  const [executedOrders, setExecutedOrders] = useState<Order[]>([]);

  const state = useSelector<AppState, AppState["gtransactions"]>(
    (state) => state.gtransactions
  ) as any;

  const fetchOpenOrders = useCallback(() => {
    if (gelatoLimitOrders && account && chainId)
      gelatoLimitOrders
        .getOpenOrders(account.toLowerCase(), includeOrdersWithNullHandler)
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account, false);
          orders.forEach((order: StopLimitOrder) => {
            const orderExists = ordersLS.find(
              (confOrder) =>
                confOrder.id.toLowerCase() === order.id.toLowerCase()
            );

            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt))
            ) {
              saveOrder(chainId, account, order, false);
            }
            saveOrder(chainId, account, order, false);
          });

          const openOrdersLS = getLSOrders(
            chainId,
            account,
            false
          ).filter((order) => order.status === "open");

          const pendingOrdersLS = getLSOrders(chainId, account, true);

          setOpenOrders({
            confirmed: openOrdersLS
              .filter((order: StopLimitOrder) => {
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
          const openOrdersLS = getLSOrders(
            chainId,
            account,
            false
          ).filter((order) => order.status === "open");

          const pendingOrdersLS = getLSOrders(chainId, account, true);

          setOpenOrders({
            confirmed: openOrdersLS
              .filter((order: StopLimitOrder) => {
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
          const ordersLS = getLSOrders(chainId, account, false);

          orders.forEach((order: StopLimitOrder) => {
            const orderExists = ordersLS.find(
              (confOrder) =>
                confOrder.id.toLowerCase() === order.id.toLowerCase()
            );
            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt))
            ) {
              saveOrder(chainId, account, order, false);
            }
          });

          const cancelledOrdersLS = getLSOrders(
            chainId,
            account,
            false
          ).filter((order) => order.status === "cancelled");

          const pendingCancelledOrdersLS = getLSOrders(
            chainId,
            account,
            true).filter((order) => order.status === "cancelled");

          setCancelledOrders({
            confirmed: cancelledOrdersLS.sort(newOrdersFirst),
            pending: pendingCancelledOrdersLS.sort(newOrdersFirst),
          });
        })
        .catch((e) => {
          console.error("Error fetching cancelled orders from subgraph", e);

          const cancelledOrdersLS = getLSOrders(
            chainId,
            account,
            false
          ).filter((order) => order.status === "cancelled");

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
          const ordersLS = getLSOrders(chainId, account, false);

          orders.forEach((order: StopLimitOrder) => {
            const orderExists = ordersLS.find(
              (confOrder) =>
                confOrder.id.toLowerCase() === order.id.toLowerCase()
            );
            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt))
            ) {
              saveOrder(chainId, account, order, false);
            }
          });

          const executedOrdersLS = getLSOrders(
            chainId,
            account,
            false
          ).filter((order) => order.status === "executed");

          setExecutedOrders(executedOrdersLS.sort(newOrdersFirst));
        })
        .catch((e) => {
          console.error("Error fetching executed orders from subgraph", e);
          const executedOrdersLS = getLSOrders(
            chainId,
            account,
            false).filter((order) => order.status === "executed");

          setExecutedOrders(executedOrdersLS.sort(newOrdersFirst));
        });
  }, [gelatoLimitOrders, account, chainId, includeOrdersWithNullHandler]);

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [
    chainId,
    state,
  ]);

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

  useInterval(fetchOpenOrders, 60000);
  useInterval(fetchCancelledOrders, 60000);
  useInterval(fetchExecutedOrders, 60000);

  return {
    open: openOrders,
    cancelled: cancelledOrders,
    executed: executedOrders,
  };
}
