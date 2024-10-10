"use client";

import { useEthereum } from "@/store/ethereum";
import Chat from "./components/Chat";
import RoomList from "./components/RoomList";
import { User } from "lucide-react";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { truncateAddress } from "@/helpers/address";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const { signer, provider, contract } = useEthereum();

  const chatRef = useRef<{
    notifyNewRoomMessage: ((roomId: string, sender: string, message: string) => Promise<void>) | undefined;
  }>({
    notifyNewRoomMessage: undefined,
  });

  const roomListRef = useRef<{
    getRoom: (() => Promise<void>) | undefined;
  }>({
    getRoom: undefined,
  });

  const [balance, setBalance] = useState("0");

  const truncatedAddress = signer?.address ? truncateAddress(signer.address, 3, -3) : "";

  useEffect(() => {
    async function getBalance(address: string) {
      try {
        const balance = (await provider?.getBalance(address)) || "0";
        setBalance(Number(ethers.formatEther(balance)).toFixed(2));
      } catch (error) {}
    }

    if (signer?.address) {
      getBalance(signer.address);
    }
  });

  useEffect(() => {
    if (!contract) return;

    function onNewMessage(roomId: string, sender: string, message: string) {
      console.log(roomId, sender, message);
      chatRef.current?.notifyNewRoomMessage?.(roomId, sender, message);
      roomListRef.current?.getRoom?.();
    }

    contract.on("NewRoomMessage", onNewMessage);

    return () => {
      contract.removeAllListeners("NewRoomMessage");
    };
  }, [contract, toast]);

  return (
    <div className="h-screen">
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-1 py-5 px-2 flex flex-col">
          <div className="flex items-center gap-2 mt-auto">
            <div className="size-8 shrink-0 bg-light-blue rounded-full flex items-center justify-center">
              <User size={15} />
            </div>
            <div className="flex flex-col">
              <p className="text-truncate text-[10px] font-semibold">{truncatedAddress}</p>
              <p className="text-muted-foreground text-[10px]">{balance || "0"} ETH</p>
            </div>
          </div>
        </div>
        <div className="col-span-5 md:col-span-4 xl:col-span-3 bg-light-blue">
          <RoomList roomListRef={roomListRef} />
        </div>
        <div className="col-span-6 md:col-span-7 xl:col-span-8">
          <Chat chatRef={chatRef} />
        </div>
      </div>
    </div>
  );
}
