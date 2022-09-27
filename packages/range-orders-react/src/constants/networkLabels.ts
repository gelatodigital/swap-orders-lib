interface NetworkData {
  idx: number;
  name: string;
  color: string;
  key: string;
}

export const NETWORK_LABELS: { [chainId: number]: NetworkData } = {
  [137]: {
    idx: 1,
    key: "137",
    name: "Polygon",
    color: "#9567FF",
  },
};
