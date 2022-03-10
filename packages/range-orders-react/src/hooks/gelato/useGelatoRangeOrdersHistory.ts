import { useCallback, useEffect, useMemo, useState } from "react";
import { RangeOrderData as Order } from "@gelatonetwork/range-orders-lib";
import { useWeb3 } from "../../web3";
import {
  getLSOrders,
  saveOrder,
  removeOrder,
} from "../../utils/localStorageOrders";
import useInterval from "../useInterval";
import { useSelector } from "react-redux";
import { AppState } from "../../state";
import useGelatoRangeOrdersLib from "./useGelatoRangeOrdersLib";
import { BigNumber } from "@ethersproject/bignumber";

export interface GelatoRangeOrdersHistory {
  open: { pending: Order[]; confirmed: Order[] };
  cancelled: { pending: Order[]; confirmed: Order[] };
  executed: Order[];
}
function newOrdersFirst(a: Order, b: Order) {
  return Number(b.updatedAt) - Number(a.updatedAt);
}

function parseOrderMap(order: any) {
  return {
    ...order,
    id:
      order.id && typeof order.id === "object"
        ? order.id
        : BigNumber.from(order.id ?? 0),
    tickThreshold: BigNumber.from(order.tickThreshold ?? 0),
    startTime: BigNumber.from(order.startTime ?? 0),
    expiryTime: BigNumber.from(order.expiryTime ?? 0),
    amountIn: BigNumber.from(order.amountIn ?? 0),
    maxFeeAmount: BigNumber.from(order.maxFeeAmount ?? 0),
    feeAmount: BigNumber.from(order.feeAmount ?? 0),
    amount0: BigNumber.from(order.amount0 ?? 0),
    amount1: BigNumber.from(order.amount1 ?? 0),
    createdAt: BigNumber.from(order.createdAt ?? 0),
    updatedAt: BigNumber.from(order.updatedAt ?? 0),
    createdAtBlock: BigNumber.from(order.createdAtBlock ?? 0),
    updatedAtBlock: BigNumber.from(order.updatedAtBlock ?? 0),
  };
}

export default function useGelatoRangeOrdersHistory(): GelatoRangeOrdersHistory {
  const { account, chainId } = useWeb3();

  const gelatoRangeOrders = useGelatoRangeOrdersLib();

  const [openOrders, setOpenOrders] = useState<{
    pending: Order[];
    confirmed: Order[];
  }>({ pending: [], confirmed: [] });
  const [cancelledOrders, setCancelledOrders] = useState<{
    pending: Order[];
    confirmed: Order[];
  }>({ pending: [], confirmed: [] });
  const [executedOrders, setExecutedOrders] = useState<Order[]>([]);

  const state = useSelector<AppState, AppState["rtransactions"]>(
    (state) => state.rtransactions
  ) as any;

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [
    chainId,
    state,
  ]);

  const fetchOpenOrders = useCallback(() => {
    if (gelatoRangeOrders && account && chainId)
      gelatoRangeOrders
        .getOpenRangeOrders(account.toLowerCase())
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account);

          orders.forEach((order: Order) => {
            const orderExists = ordersLS.find(
              (confOrder) => confOrder.submittedTxHash === order.submittedTxHash
            );

            if (
              !orderExists ||
              (orderExists &&
                Number(orderExists.updatedAt) < Number(order.updatedAt))
            ) {
              saveOrder(chainId, account, order);
            }
          });

          const openOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "submitted"
          );

          const pendingOrdersLS = getLSOrders(chainId, account, true);

          setOpenOrders({
            confirmed: openOrdersLS
              .filter((order: Order) => {
                const orderCancelled = pendingOrdersLS
                  .filter((pendingOrder) => pendingOrder.status === "cancelled")
                  .find(
                    (pendingOrder) =>
                      pendingOrder.submittedTxHash === order.submittedTxHash
                  );
                return orderCancelled ? false : true;
              })
              .map(parseOrderMap)
              .sort(newOrdersFirst),
            pending: pendingOrdersLS
              .filter((order) => order.status === "submitted")
              .map(parseOrderMap)
              .sort(newOrdersFirst),
          });
        })
        .catch((e) => {
          console.error("Error fetching open orders from subgraph", e);
          const openOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "submitted"
          );

          const pendingOrdersLS = getLSOrders(chainId, account, true);

          setOpenOrders({
            confirmed: openOrdersLS
              .filter((order: Order) => {
                const orderCancelled = pendingOrdersLS
                  .filter((pendingOrder) => pendingOrder.status === "cancelled")
                  .find(
                    (pendingOrder) =>
                      pendingOrder.submittedTxHash === order.submittedTxHash
                  );
                return orderCancelled ? false : true;
              })
              .map(parseOrderMap)
              .sort(newOrdersFirst),
            pending: pendingOrdersLS
              .filter((order) => order.status === "submitted")
              .map(parseOrderMap)
              .sort(newOrdersFirst),
          });
        });
  }, [gelatoRangeOrders, account, chainId]);

  const fetchCancelledOrders = useCallback(() => {
    if (gelatoRangeOrders && account && chainId)
      gelatoRangeOrders
        .getCancelledRangeOrders(account.toLowerCase())
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account);

          orders.forEach((order: Order) => {
            const orderExists = ordersLS.find(
              (confOrder) => confOrder.submittedTxHash === order.submittedTxHash
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
            confirmed: cancelledOrdersLS
              .map(parseOrderMap)
              .sort(newOrdersFirst),
            pending: pendingCancelledOrdersLS
              .map(parseOrderMap)
              .sort(newOrdersFirst),
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
            confirmed: cancelledOrdersLS
              .map(parseOrderMap)
              .sort(newOrdersFirst),
            pending: pendingCancelledOrdersLS
              .map(parseOrderMap)
              .sort(newOrdersFirst),
          });
        });
  }, [gelatoRangeOrders, account, chainId]);

  const fetchExecutedOrders = useCallback(() => {
    if (gelatoRangeOrders && account && chainId)
      gelatoRangeOrders
        .getExecutedRangeOrders(account.toLowerCase())
        .then(async (orders) => {
          const ordersLS = getLSOrders(chainId, account);

          orders.forEach((order: Order) => {
            const orderExists = ordersLS.find(
              (confOrder) => confOrder.submittedTxHash === order.submittedTxHash
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

          setExecutedOrders(
            executedOrdersLS.map(parseOrderMap).sort(newOrdersFirst)
          );
        })
        .catch((e) => {
          console.error("Error fetching executed orders from subgraph", e);
          const executedOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "executed"
          );

          setExecutedOrders(
            executedOrdersLS.map(parseOrderMap).sort(newOrdersFirst)
          );
        });
  }, [gelatoRangeOrders, account, chainId]);

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
