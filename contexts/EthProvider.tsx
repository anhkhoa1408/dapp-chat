"use client";

import { useChatServices } from "@/hooks/useChatServices";
import { useEthereum } from "@/store/ethereum";
import { ethers } from "ethers";
import { ReactNode, useCallback, useEffect } from "react";
import Messenger from "./../artifacts/contracts/Messenger.sol/Messenger.json";

const EthProvider = ({ children }: { children: ReactNode }) => {
  const { saveInit } = useEthereum();

  const connectContract = useCallback(async () => {
    try {
      if (window.ethereum) {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const accounts = await provider.listAccounts();
        const contract = new ethers.Contract(contractAddress, Messenger.abi, signer);

        saveInit({
          signer,
          network,
          accounts,
          contract,
          provider,
        });
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    connectContract();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const events = ["accountsChanged", "chainChanged"];

      const handleChange = () => {
        connectContract();
      };

      events.forEach((e) => window.ethereum.on(e, handleChange));
      return () => {
        events.forEach((e) => window.ethereum.removeListener(e, handleChange));
      };
    }
  }, []);
  return children;
};

export default EthProvider;
