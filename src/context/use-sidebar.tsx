"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";

const useSideBar = () => {
  const [expand, setExpand] = useState<boolean | undefined>(undefined);
  const pathName = usePathname();
  const page = pathName.split("/").pop();
  const { signOut } = useClerk();

  const onSignOut = () => signOut({ redirectUrl: "/" });

  const onExpand = () => setExpand((prev) => !prev);

  return { expand, onExpand, page, onSignOut };
};

export default useSideBar;
