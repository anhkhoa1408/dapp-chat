import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { truncateAddress } from "@/helpers/address";
import { toast } from "@/hooks/use-toast";
import { useChatServices } from "@/hooks/useChatServices";
import { useEthereum } from "@/store/ethereum";
import { useRoom } from "@/store/room";
import { Message as IMessage } from "@/types/message.type";
import { MailOpen, Send } from "lucide-react";
import Image from "next/image";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import Message from "./Message";

const Chat = ({ chatRef }: { chatRef: MutableRefObject<object> }) => {
  const { signer } = useEthereum();
  const { selectedRoom, setSelectedRoom } = useRoom();
  const { getMessageByRoom, sendMessageToRoom } = useChatServices();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const currentAccount = signer?.address || "";

  const submitChat = async () => {
    if (!selectedRoom?.roomId || !message) return;

    const initialMessages = [...messages];
    setSubmitting(true);
    setMessage("");
    setMessages([
      ...initialMessages,
      {
        isDeleted: "false",
        timestamp: 0,
        message,
        sender: currentAccount,
      },
    ]);

    try {
      await sendMessageToRoom?.(selectedRoom.roomId, message);
    } catch (error) {
      setSubmitting(false);
      setMessages(initialMessages);
    }
  };

  const getMessages = useCallback(
    async (roomId: string) => {
      const messages = await getMessageByRoom?.(roomId);
      const decodedMessages = messages.map((msg: IMessage) => ({
        isDeleted: msg.isDeleted,
        timestamp: msg.timestamp.toString(),
        message: msg.message,
        sender: msg.sender,
      }));
      setMessages(decodedMessages);
    },
    [getMessageByRoom],
  );

  const scrollToBottom = useCallback(() => {
    const ele = document.getElementById("chat-wrap") as HTMLDivElement;
    if (ele) ele.scrollTop = ele.scrollHeight;
  }, []);

  const notifyNewRoomMessage = useCallback(
    async (roomId: string, sender: string, message: string) => {
      setSubmitting(false);

      if (selectedRoom?.roomId && BigInt(selectedRoom.roomId) === BigInt(roomId)) await getMessages(roomId);

      if (sender !== currentAccount)
        toast({
          title: `New message from ${truncateAddress(sender, 3, -3)}`,
          description: message,
        });
    },
    [selectedRoom?.roomId, getMessages, toast, currentAccount],
  );

  useEffect(() => {
    setMessages([]);
    setSelectedRoom(undefined);
    setSubmitting(false);
  }, [signer]);

  useEffect(() => {
    if (selectedRoom?.roomId) {
      getMessages(selectedRoom.roomId);
    }
  }, [selectedRoom?.roomId]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    chatRef.current = {
      notifyNewRoomMessage,
    };
  }, [chatRef?.current, notifyNewRoomMessage]);

  return !selectedRoom?.roomId ? (
    <div className="h-screen flex flex-col items-center justify-center">
      <MailOpen size={60} className="mb-5 text-muted-foreground" />
      <p className="text-muted-foreground text-xs">You have no new message, create room to start chatting</p>
    </div>
  ) : (
    <div className="flex flex-col h-screen">
      <div className="flex items-center p-5 gap-3 sticky top-0">
        <div className="relative size-10 rounded-full">
          <Image
            src={`https://avatar.iran.liara.run/username?username=${selectedRoom?.roomName || ""}`}
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-sm mb-1">{selectedRoom?.roomName || ""}</p>
          <p className="text-[10px] uppercase text-primary font-semibold">
            {selectedRoom?.participants?.length > 2 ? "Group chat" : "P2P chat"}
          </p>
        </div>
      </div>
      <div id="chat-wrap" className="grow overflow-y-auto flex flex-col p-5 space-y-4">
        {messages?.map((mess, idx) => {
          const truncateAddress = mess.sender.slice(-3);
          const isCurrentAccount = mess.sender === currentAccount;
          return mess?.isDeleted === "true" ? null : (
            <Message
              key={mess.timestamp}
              message={mess}
              isCurrentAccount={isCurrentAccount}
              address={truncateAddress}
            />
          );
        })}
      </div>
      <div className="flex items-center p-5 gap-5 sticky bottom-0">
        <Input
          disabled={submitting}
          value={message}
          onKeyUp={(e) => e.key === "Enter" && submitChat()}
          placeholder="Type something"
          className="bg-light-blue"
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={submitChat} disabled={!message || submitting} variant="default" size="icon">
          <Send size={17} />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
