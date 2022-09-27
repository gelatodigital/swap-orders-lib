import React from "react";
import { useWeb3 } from "../../web3";
import styled from "styled-components";
import { SwitchNetworkButton } from "../SwitchNetworkButton";
import { ALL_SUPPORTED_CHAIN_IDS } from "../../constants/chains";

const NetworkButtonAligner = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Web3Guard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { chainId } = useWeb3();
  const DEFAULT_NETWORK_ID = 137;
  if (chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId)) {
    return <>{children}</>;
  } else
    return (
      <NetworkButtonAligner>
        <SwitchNetworkButton
          network={DEFAULT_NETWORK_ID}
          onClick={() => null}
          disabled={true}
        />
      </NetworkButtonAligner>
    );
};
