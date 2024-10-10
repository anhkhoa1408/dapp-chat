// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Messenger {
    struct Room {
        uint roomId;
        string roomName;
        address[] participants;
        Message[] messages;
    }

    struct Message {
        bool isDeleted;
        uint timestamp;
        string message;
        address sender;
    }

    mapping(uint => Room) public rooms;
    uint roomCount = 0;

    event RoomCreated(uint256 roomId, string roomName, address creator);

    event NewRoomMessage(
        uint256 indexed roomId,
        address indexed sender,
        string message,
        uint256 timestamp
    );

    modifier isParticipant(uint _roomId) {
        bool found = false;
        for (uint256 i = 0; i < rooms[_roomId].participants.length; i++) {
            if (rooms[_roomId].participants[i] == msg.sender) {
                found = true;
                break;
            }
        }
        require(found, "You are not the participants of this group");
        _;
    }

    function createRoom(
        string memory _roomName,
        address[] memory _participants
    ) public {
        require(_participants.length > 0, "Room must have participants");
        address[] memory allParticipants = new address[](
            _participants.length + 1
        );

        allParticipants[0] = msg.sender;
        for (uint i = 0; i < _participants.length; i++) {
            allParticipants[i + 1] = _participants[i];
        }

        Room storage newRoom = rooms[roomCount];
        newRoom.roomId = roomCount;
        newRoom.roomName = _roomName;
        newRoom.participants = allParticipants;

        emit RoomCreated(roomCount, _roomName, msg.sender);

        roomCount++;
    }

    function sendMessageToRoom(
        uint _roomId,
        string memory _message
    ) public isParticipant(_roomId) {
        Message memory message = Message({
            timestamp: block.timestamp,
            isDeleted: false,
            message: _message,
            sender: msg.sender
        });

        rooms[_roomId].messages.push(message);
        emit NewRoomMessage(_roomId, msg.sender, _message, block.timestamp);
    }

    function getMessageByRoom(
        uint _roomId
    ) public view returns (Message[] memory) {
        uint messageCount = 0;
        for (uint i = 0; i < rooms[_roomId].messages.length; i++) {
            if (rooms[_roomId].messages[i].isDeleted == false) {
                messageCount++;
            }
        }

        Message[] memory messageWithoutDelete = new Message[](messageCount);
        uint curIndex = 0;
        for (uint i = 0; i < rooms[_roomId].messages.length; i++) {
            if (rooms[_roomId].messages[i].isDeleted == false) {
                messageWithoutDelete[curIndex] = rooms[_roomId].messages[i];
                curIndex++;
            }
        }
        return messageWithoutDelete;
    }

    function getRoomsByUser() public view returns (Room[] memory) {
        uint userRoomsCount = 0;
        for (uint i = 0; i < roomCount; i++) {
            for (uint j = 0; j < rooms[i].participants.length; j++) {
                if (msg.sender == rooms[i].participants[j]) {
                    userRoomsCount++;
                    break;
                }
            }
        }

        Room[] memory userRooms = new Room[](userRoomsCount);
        uint curIndex = 0;
        for (uint i = 0; i < roomCount; i++) {
            for (uint j = 0; j < rooms[i].participants.length; j++) {
                if (msg.sender == rooms[i].participants[j]) {
                    userRooms[curIndex] = rooms[i];
                    curIndex++;
                    break;
                }
            }
        }
        return userRooms;
    }
}
