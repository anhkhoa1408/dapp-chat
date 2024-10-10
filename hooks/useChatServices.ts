"use client";

import { useEthereum } from "@/store/ethereum";
import { useCallback } from "react";

export function useChatServices() {
  const { contract } = useEthereum();

  const createRoom = useCallback(
    (name: string, participants: string[]) => {
      return contract?.createRoom(name, participants);
    },
    [contract],
  );

  const sendMessageToRoom = useCallback(
    (roomId: string, message: string) => {
      return contract?.sendMessageToRoom(roomId, message);
    },
    [contract],
  );

  const getMessageByRoom = useCallback(
    (roomId: string) => {
      return contract?.getMessageByRoom(roomId);
    },
    [contract],
  );

  const getRoomsByUser = useCallback(() => {
    return contract?.getRoomsByUser();
  }, [contract]);

  return {
    createRoom,
    sendMessageToRoom,
    getMessageByRoom,
    getRoomsByUser,
  };
}
