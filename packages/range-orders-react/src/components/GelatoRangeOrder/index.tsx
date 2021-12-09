import React, { Fragment, useState } from "react";
import AppBody from "./AppBody";
import SwapHeader from "../order/SwapHeader";

export default function GelatoRangeOrder() {
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");
  const handleActiveTab = (tab: "sell" | "buy") => {
    if (activeTab === tab) return;
    setActiveTab(tab);
  };

  return (
    <Fragment>
      <AppBody>
        <SwapHeader handleActiveTab={handleActiveTab} activeTab={activeTab} />
      </AppBody>
    </Fragment>
  );
}
