import { Message } from "./message.type";

export interface Room {
  roomId: string;
  roomName: string;
  participants: string[];
  messages: Message[];
}
