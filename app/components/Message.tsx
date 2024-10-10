import { Message as IMessage } from "@/types/message.type";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import React from "react";

const Message = ({
  message,
  isCurrentAccount,
  address,
}: {
  message: IMessage;
  isCurrentAccount: boolean;
  address: string;
}) => {
  return (
    <div
      key={message.timestamp}
      className={clsx("items-start gap-2 max-w-[80%] md:max-w-[70%] lg:max-w-[60%]", {
        "justify-start flex": !isCurrentAccount,
        "justify-end flex flex-row-reverse ml-auto": isCurrentAccount,
      })}
    >
      <div
        className={clsx("relative size-9 rounded-full text-xs flex items-center justify-center shrink-0", {
          "bg-light-blue": !isCurrentAccount,
          "bg-primary text-white": isCurrentAccount,
        })}
      >
        {address}
      </div>
      <div
        className={clsx("flex flex-col gap-1", {
          "items-start": !isCurrentAccount,
          "items-end": isCurrentAccount,
        })}
      >
        <div
          className={clsx("text-xs p-4 flex", {
            "rounded-2xl rounded-tl-none bg-light-blue": !isCurrentAccount,
            "rounded-2xl rounded-tr-none bg-primary text-white": isCurrentAccount,
          })}
        >
          {message.message}
        </div>
        {!message.timestamp && (
          <span className="inline-block">
            <LoaderCircle className="animate-spin" size={14} />
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;
