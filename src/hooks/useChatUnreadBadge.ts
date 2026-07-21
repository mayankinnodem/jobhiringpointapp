import { useCallback, useEffect, useState } from "react";
import { fetchChatUnreadCount } from "@/api/chat";

export function useChatUnreadBadge(enabled: boolean) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCount(0);
      return;
    }
    try {
      setCount(await fetchChatUnreadCount());
    } catch {
      /* ignore */
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 20000);
    return () => clearInterval(id);
  }, [refresh]);

  return { count, refresh };
}
