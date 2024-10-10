import { Room } from "@/types/room.type";
import { create } from "zustand";

interface RoomState {
  selectedRoom?: Room;
}

interface RoomAction {
  setSelectedRoom: (room?: Room) => void;
}

export const useRoom = create<RoomState & RoomAction>((set) => ({
  setSelectedRoom: (room) => set(() => ({ selectedRoom: room })),
}));
