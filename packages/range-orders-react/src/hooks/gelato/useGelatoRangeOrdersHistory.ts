import { useCallback, useEffect, useMemo, useState } from "react";
import { RangeOrderData as Order } from "@gelatonetwork/range-orders-lib";
import { useWeb3 } from "../../web3";
import { getLSOrders, saveOrder } from "../../utils/localStorageOrders";
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
    id: BigNumber.from(order.id),
    tickThreshold: BigNumber.from(order.tickThreshold),
    startTime: BigNumber.from(order.startTime),
    expiryTime: BigNumber.from(order.expiryTime),
    amountIn: BigNumber.from(order.amountIn),
    maxFeeAmount: BigNumber.from(order.maxFeeAmount),
    feeAmount: BigNumber.from(order.feeAmount ?? 0),
    amount0: BigNumber.from(order.amount0 ?? 0),
    amount1: BigNumber.from(order.amount1 ?? 0),
    createdAt: BigNumber.from(order.createdAt),
    updatedAt: BigNumber.from(order.updatedAt),
    createdAtBlock: BigNumber.from(order.createdAtBlock),
    updatedAtBlock: BigNumber.from(order.updatedAtBlock),
  };
}

export default function useGelatoLimitOrdersHistory(): GelatoRangeOrdersHistory {
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
            const orderExists = ordersLS.find((confOrder) =>
              BigNumber.from(confOrder.id).eq(BigNumber.from(order.id))
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
                  .find((pendingOrder) =>
                    BigNumber.from(pendingOrder.id).eq(BigNumber.from(order.id))
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
                  .find((pendingOrder) =>
                    BigNumber.from(pendingOrder.id).eq(BigNumber.from(order.id))
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
            const orderExists = ordersLS.find((confOrder) =>
              BigNumber.from(confOrder.id).eq(BigNumber.from(order.id))
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
            const orderExists = ordersLS.find((confOrder) =>
              BigNumber.from(confOrder.id).eq(BigNumber.from(order.id))
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
            executedOrdersLS
              .map((order: any) => {
                return {
                  ...order,
                  id: BigNumber.from(order.id),
                  tickThreshold: BigNumber.from(order.tickThreshold),
                  startTime: BigNumber.from(order.startTime),
                  expiryTime: BigNumber.from(order.expiryTime),
                  amountIn: BigNumber.from(order.amountIn),
                  maxFeeAmount: BigNumber.from(order.maxFeeAmount),
                  feeAmount: BigNumber.from(order.feeAmount),
                  amount0: BigNumber.from(order.amount0),
                  amount1: BigNumber.from(order.amount1),
                  createdAt: BigNumber.from(order.createdAt),
                  updatedAt: BigNumber.from(order.updatedAt),
                  createdAtBlock: BigNumber.from(order.createdAtBlock),
                  updatedAtBlock: BigNumber.from(order.updatedAtBlock),
                };
              })
              .sort(newOrdersFirst)
          );
        })
        .catch((e) => {
          console.error("Error fetching executed orders from subgraph", e);
          const executedOrdersLS = getLSOrders(chainId, account).filter(
            (order) => order.status === "executed"
          );

          setExecutedOrders(
            executedOrdersLS
              .map((order: Order) => {
                return {
                  ...order,
                  id: BigNumber.from(order.id),
                  tickThreshold: BigNumber.from(order.tickThreshold),
                  startTime: BigNumber.from(order.startTime),
                  expiryTime: BigNumber.from(order.expiryTime),
                  amountIn: BigNumber.from(order.amountIn),
                  maxFeeAmount: BigNumber.from(order.maxFeeAmount),
                  feeAmount: BigNumber.from(order.feeAmount),
                  amount0: BigNumber.from(order.amount0),
                  amount1: BigNumber.from(order.amount1),
                  createdAt: BigNumber.from(order.createdAt),
                  updatedAt: BigNumber.from(order.updatedAt),
                  createdAtBlock: BigNumber.from(order.createdAtBlock),
                  updatedAtBlock: BigNumber.from(order.updatedAtBlock),
                };
              })
              .sort(newOrdersFirst)
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
