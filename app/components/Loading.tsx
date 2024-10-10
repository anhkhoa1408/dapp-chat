import { LoaderCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <span className="inline-block">
      <LoaderCircle className="animate-spin" size={14} />
    </span>
  );
};

export default Loading;
