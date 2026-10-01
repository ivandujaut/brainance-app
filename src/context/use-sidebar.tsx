"use client";
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useChatContext } from "./user-chat-context";
import { onGetConversationMode, onToggleRealtime } from "@/actions/conversation";
import { useClerk } from "@clerk/nextjs";

const useSideBar = () => {
  const [expand, setExpand] = useState<boolean | undefined>(undefined);
  const pathName = usePathname();
  const { toast } = useToast();
  const [realtime, setRealtime] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { chatRoom } = useChatContext();

  const onActivateRealTime = async (e: any) => {
    try {
      const realtime = await onToggleRealtime(chatRoom!, e.target.ariaChecked == "true" ? false : true);
      if (realtime) {
        setRealtime(realtime.chatRoom.live);
        toast({
          title: "Success",
          description: realtime.message,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onGetCurrentMode = async () => {
    setLoading(true);
    const mode = await onGetConversationMode(chatRoom!);
    if (mode) {
      setRealtime(mode.live);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatRoom) {
      onGetCurrentMode();
    }
  }, [chatRoom]);

  const page = pathName.split("/").pop();
  const { signOut } = useClerk();

  const onSignOut = () => signOut({ redirectUrl: "/" });

  const onExpand = () => setExpand((prev) => !prev);

  return {
    expand,
    onExpand,
    page,
    onSignOut,
    realtime,
    onActivateRealTime,
    chatRoom,
    loading,
  };
};

export default useSideBar;
