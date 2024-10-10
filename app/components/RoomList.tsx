import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/helpers/address";
import { toast } from "@/hooks/use-toast";
import { useChatServices } from "@/hooks/useChatServices";
import { useEthereum } from "@/store/ethereum";
import { useRoom } from "@/store/room";
import { Message } from "@/types/message.type";
import { Room as IRoom } from "@/types/room.type";
import { Plus } from "lucide-react";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import CreateRoom from "./CreateRoom";
import Room from "./Room";

const SkeletonRoom = () => {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-main h-[60px]">
      <Skeleton className="rounded-full size-10 shrink-0" />
      <div className=" grow flex flex-col gap-2">
        <Skeleton className="rounded-md h-[15px] w-11/12" />
        <Skeleton className="rounded-md h-[15px] w-5/12" />
      </div>
    </div>
  );
};

const RoomList = ({ roomListRef }: { roomListRef: MutableRefObject<object> }) => {
  const { contract, signer } = useEthereum();
  const { setSelectedRoom } = useRoom();
  const { getRoomsByUser } = useChatServices();

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const getRoom = useCallback(async () => {
    setLoading(true);
    try {
      const rooms = await getRoomsByUser();
      const decodedRooms = rooms.map((room: IRoom) => ({
        roomId: room.roomId.toString(),
        roomName: room.roomName,
        participants: room.participants.map((participant: string) => participant),
        messages: room.messages.map((msg: Message) => ({
          isDeleted: msg.isDeleted,
          timestamp: msg.timestamp.toString(),
          message: msg.message,
          sender: msg.sender,
        })),
      }));
      setRooms(decodedRooms);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [contract, getRoomsByUser, setSelectedRoom]);

  useEffect(() => {
    getRoom();
    setSelectedRoom(undefined);
  }, [signer]);

  useEffect(() => {
    roomListRef.current = {
      getRoom,
    };
  }, [roomListRef.current, getRoom]);

  useEffect(() => {
    if (!contract) return;

    async function notifyRoomCreated(roomId: string, roomName: string, creator: string) {
      await getRoom();
      toast({
        title: "New room created",
        description:
          creator === signer?.address
            ? "Created room successfully!"
            : `You have join room ${roomName} created by ${truncateAddress(creator, 3, -3)}`,
      });
    }

    contract.on("RoomCreated", notifyRoomCreated);

    return () => {
      contract.removeAllListeners("RoomCreated");
    };
  }, [contract, toast, signer]);

  const removeVietnameseSigns = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredRooms = rooms.filter((room) => {
    const isMatchRoomName = removeVietnameseSigns(room.roomName).indexOf(removeVietnameseSigns(searchKeyword)) > -1;
    const isMatchMsgText = room.messages.some((mes) => removeVietnameseSigns(mes.message).indexOf(searchKeyword) > -1);
    return isMatchMsgText || isMatchRoomName;
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex p-5 gap-4 sticky top-0 bg-light-blue z-20">
        <Input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search room, chat"
          className="bg-white"
        />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger
            onClick={() => setOpenDialog(true)}
            className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center shrink-0"
          >
            <Plus size={17} />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl mb-2">Create room</DialogTitle>
              <CreateRoom toggleOpenDialog={setOpenDialog} />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col space-y-1 overflow-y-auto overflow-x-hidden">
        {loading
          ? Array.from({ length: 8 }, (_, index) => <SkeletonRoom key={index} />)
          : filteredRooms.map((room) => <Room key={room.roomId} data={room} />)}
      </div>
    </div>
  );
};

export default RoomList;
