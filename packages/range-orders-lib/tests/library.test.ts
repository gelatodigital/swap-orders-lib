import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber, ethers, providers, utils } from "ethers";
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
    const goerliChainId = 137;
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

    const expectedPrice = BigNumber.from("0");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0])
      expect(Number(expectedPrice.toString())).to.be.lt(
        Number(
          (
            await gelatoRangeOrder.getExchangeRate(results[0].pool as string)
          ).toString()
        )
      );
  });

  it("#7: Get Min Return", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0].amountIn && results[0].receiver)
      console.log(
        (
          await gelatoRangeOrder.getMinReturn({
            pool: results[0].pool as string,
            zeroForOne: results[0].zeroForOne as boolean,
            tickThreshold: results[0].tickThreshold as unknown as number,
            amountIn: results[0].amountIn,
            receiver: results[0].receiver,
            maxFeeAmount: ethers.constants.Zero,
          })
        ).toString()
      );
  });

  it("#8: Get NearTicks from price", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0]) {
      console.log("tickThreshold -------->", results[0].tickThreshold);
      console.log(
        "getTicks -------->",
        await gelatoRangeOrder.getNearTicks(
          results[0].pool as string,
          ethers.utils.parseUnits("60", 18)
        )
      );
    }
  });

  it("#9: Get Tick from price", async () => {
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

  it("#10: Get Nearest Prices", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0]) {
      console.log(results[0].pool);
      console.log(
        await gelatoRangeOrder.getNearestPrice(
          results[0].pool as string,
          utils.parseUnits("60", 18)
        )
      );
    }
  });

  // Get price for MATIC/USDC pool
  it("#10: Get Nearest Prices for MATIC/USDC pool", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0]) {
      console.log(results[0].pool);
      console.log(
        await gelatoRangeOrder.getNearestPrice(
          "0xA374094527e1673A86dE625aa59517c5dE346d32",
          utils.parseUnits("18700000000000000", 18)
        )
      );
    }
  });

  it("#11: Get NearTicks from price for MATIC/USDC pool", async () => {
    console.log(
      "getTicks -------->",
      await gelatoRangeOrder.getNearTicks(
        "0xA374094527e1673A86dE625aa59517c5dE346d32",
        ethers.utils.parseUnits("18700000000000000", 18)
      )
    );
  });

  const wethusdc = "0x45dDa9cb7c25131DF268515131f647d726f50608";
  // Get price for WETH/USDC pool
  it("#10: Get Nearest Prices for MATIC/USDC pool", async () => {
    let results: RangeOrderData[] = [];
    if (ADDR)
      results = (await gelatoRangeOrder.getExecutedRangeOrders(
        ADDR.toLowerCase()
      )) as RangeOrderData[];
    else fail("user address not valid");

    if (results.length == 0) fail("No range order to check.");
    else if (results[0]) {
      console.log(results[0].pool);
      console.log(
        await gelatoRangeOrder.getNearestPrice(
          wethusdc,
          utils.parseUnits("0.000318559", 18)
        )
      );
    }
  });

  it("#11: Get NearTicks from price for MATIC/USDC pool", async () => {
    console.log(
      "getTicks -------->",
      await gelatoRangeOrder.getNearTicks(
        wethusdc,
        ethers.utils.parseUnits("0.000318559", 18)
      )
    );
  });
});
