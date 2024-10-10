"use client";

import { JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";
import { Network } from "ethers";
import { Contract } from "ethers";
import { create } from "zustand";

interface EthereumState {
  contract?: Contract;
  accounts?: JsonRpcSigner[];
  signer?: JsonRpcSigner;
  network?: Network;
  provider?: BrowserProvider;
}

interface EthereumAction {
  saveInit: (newState: EthereumState) => void;
}

export const useEthereum = create<EthereumState & EthereumAction>((set) => ({
  saveInit: (newState: EthereumState) => set(newState),
}));
