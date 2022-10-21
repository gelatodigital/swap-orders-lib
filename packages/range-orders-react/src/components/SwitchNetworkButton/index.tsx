import React from "react";
import { ButtonPrimary } from "../Button";
import { NETWORK_LABELS } from "../../constants/networkLabels";

export function SwitchNetworkButton({
  onClick: handleNetworkSwitch,
  network,
  disabled,
}: {
  onClick: () => void;
  network: number;
  disabled: boolean;
}) {
  return (
    <ButtonPrimary
      onClick={handleNetworkSwitch}
      style={{
        width: "100%",
        maxWidth: "280px",
        padding: "10px",
        marginBottom: "2rem",
      }}
      disabled={disabled}
    >
      Switch to {NETWORK_LABELS[network].name} Network
    </ButtonPrimary>
  );
}
