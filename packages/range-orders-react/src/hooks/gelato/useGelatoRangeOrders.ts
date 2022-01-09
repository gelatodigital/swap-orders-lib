import useGelatoRangeOrdersHandlers, {
  GelatoRangeOrdersHandlers,
} from "./useGelatoRangeOrdersHandlers";
import {
  DerivedOrderInfo,
  useDerivedOrderInfo,
  useOrderState,
} from "../../state/gorder/hooks";
import { OrderState } from "../../state/gorder/reducer";

export default function useGelatoRangeOrders(): {
  handlers: GelatoRangeOrdersHandlers;
  derivedOrderInfo: DerivedOrderInfo;
  orderState: OrderState;
} {
  const derivedOrderInfo = useDerivedOrderInfo();

  const orderState = useOrderState();

  const handlers = useGelatoRangeOrdersHandlers();

  return {
    handlers,
    derivedOrderInfo,
    orderState,
  };
}
