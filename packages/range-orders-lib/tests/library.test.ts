import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber, ethers, providers } from "ethers";
import { GelatoRangeOrder } from "../src/range-orders";
import { expect } from "chai";
import dotenv from "dotenv";
import { RangeOrderData } from "../src/types";
import { fail } from "assert";

dotenv.config();

const URL = process.env.URL;
const ADDR = process.env.ADDR;

describe("Library Test", () => {
  let gelatoRangeOrder: GelatoRangeOrder;

  beforeEach(async () => {
    const goerliChainId = 5;
    const provider: Provider = new providers.JsonRpcProvider(URL);
    gelatoRangeOrder = new GelatoRangeOrder(goerliChainId, provider);
  });

  it("#0: Get Cancelled Range Order (Need to have a ranger order cancelled)", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getCancelledRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    console.log("Cancel Range Orders list length : ", results.length);
    for (const res of results) {
      expect(res.status).to.be.eq("cancelled");
    }
  });

  it("#1: Get Executed Range Order (Need to have a ranger order executed)", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    console.log("Executed Range Orders list length : ", results.length);
    for (const res of results) {
      expect(res.status).to.be.eq("executed");
    }
  });

  it("#2: Get Open Range Order (Need to have a ranger order submitted)", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getOpenRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    console.log("Open Range Orders list length : ", results.length);
    for (const res of results) {
      expect(res.status).to.be.eq("submitted");
    }
  });

  it("#3: isActiveRangeOrder check if tokenId is an open order (Need to have a ranger order submitted)", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getOpenRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    for (const res of results) {
      console.log("Check with open order Token Id: ", res.id);
      expect(await gelatoRangeOrder.isActiveRangeOrder(res.id)).to.be.true;
    }
  });

  it("#4: isActiveRangeOrder check if tokenId is an cancelled order (Need to have a ranger order cancelled)", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getCancelledRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    for (const res of results) {
      console.log("Check with cancelled order Token Id: ", res.id);
      expect(await gelatoRangeOrder.isActiveRangeOrder(res.id)).to.be.false;
    }
  });

  it("#5: isActiveRangeOrder check if tokenId is an executed order (Need to have a ranger order executed)", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    for (const res of results) {
      console.log("Check with executed order Token Id: ", res.id);
      expect(await gelatoRangeOrder.isActiveRangeOrder(res.id)).to.be.false;
    }
  });

  it("#6: Get Pool price", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    const expectedPrice = BigNumber.from("51223156983233948619");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0])
      expect(expectedPrice.toString()).to.be.eq(
        (
          await gelatoRangeOrder.getExchangeRate(results[0].pool as string)
        ).toString()
      );
  });

  it("#6: Get Pool price", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0])
      console.log(
        (
          await gelatoRangeOrder.getFeeAdjustedMinReturn({
            pool: results[0].pool as string,
            zeroForOne: results[0].zeroForOne as boolean,
            ejectDust: results[0].ejectDust,
            tickThreshold: results[0].tickThreshold as unknown as number,
            amountIn: results[0].amountIn,
            minAmountOut: (results[0].zeroForOne
              ? results[0].amount1Min
              : results[0].amount0Min) as BigNumber,
            receiver: results[0].receiver,
            maxFeeAmount: ethers.constants.Zero,
          })
        ).toString()
      );
  });

  it("#7: Get Tick from price", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0]) {
      console.log(results[0].tickThreshold);
      console.log(
        await gelatoRangeOrder.getNearTicks(
          results[0].pool as string,
          ethers.utils.parseUnits("60", 18)
        )
      );
    }
  });

  it("#8: Get Tick from price", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0]) {
      console.log(results[0].tickThreshold);
      console.log(
        (
          await gelatoRangeOrder.getPriceFromTick(
            results[0].pool as string,
            40920
          )
        ).lowerPrice.toString()
      );
    }
  });
});
