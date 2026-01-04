import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { connectMessagingSocket, disconnectMessagingSocket } from "@/services/messagingSocket";

export default function MessagingLayout() {
  useEffect(() => {
    connectMessagingSocket();
    return () => {
      disconnectMessagingSocket();
    };
  }, []);

  return <Outlet />;
}