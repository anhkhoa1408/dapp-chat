import { truncateAddress } from "@/helpers/address";
import { useEthereum } from "@/store/ethereum";
import { useRoom } from "@/store/room";
import { Room as IRoom } from "@/types/room.type";
import clsx from "clsx";
import Image from "next/image";
import { useMemo } from "react";

interface RoomProps {
  data: IRoom;
}

const Room = ({ data }: RoomProps) => {
  const { signer } = useEthereum();
  const { selectedRoom, setSelectedRoom } = useRoom();

  const onSelectedRoom = (room: IRoom) => {
    setSelectedRoom(room);
  };

  const lastMessage = useMemo(() => {
    if (!data?.messages?.length) return "New chat created";

    const reverseMessArr = data.messages.reverse();

    return !reverseMessArr?.[0]?.sender
      ? ""
      : signer?.address === reverseMessArr?.[0]?.sender
      ? "You: " + reverseMessArr?.[0]?.message
      : `${truncateAddress(reverseMessArr?.[0]?.sender || "", 3, -3)}: ${reverseMessArr?.[0]?.message}`;
  }, [data?.messages]);

  return (
    <div
      onClick={() => onSelectedRoom(data)}
      className={clsx("flex items-center gap-3 py-3 px-3 hover:bg-white rounded-main mx-2 cursor-pointer", {
        "bg-white": data.roomId === selectedRoom?.roomId,
      })}
    >
      <div className="relative size-10 rounded-full shrink-0">
        <Image
          src={`https://avatar.iran.liara.run/username?username=${data.roomName}`}
          alt=""
          fill
          className="object-contain"
          sizes="40w"
        />
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-truncate">{data.roomName}</p>
        <p className="text-sm text-slate-500 text-truncate">{lastMessage}</p>
      </div>
    </div>
  );
};

export default Room;
