import useGelatoStopLimitOrdersHandlers, {
  GelatoStopLimitOrdersHandlers,
} from "./useGelatoStopLimitOrdersHandlers";
import {
  DerivedOrderInfo,
  useDerivedOrderInfo,
  useOrderState,
} from "../../state/gstoplimit/hooks";
import { StopLimitOrderState } from "../../state/gstoplimit/reducer";

export default function useGelatoLimitOrders(): {
  handlers: GelatoStopLimitOrdersHandlers;
  derivedOrderInfo: DerivedOrderInfo;
  orderState: StopLimitOrderState;
} {
  const derivedOrderInfo = useDerivedOrderInfo();

  const orderState = useOrderState();

  const handlers = useGelatoStopLimitOrdersHandlers();

  return {
    handlers,
    derivedOrderInfo,
    orderState,
  };
}
