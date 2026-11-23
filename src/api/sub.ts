import { useAppStore } from "../store/appStore";
import { getTelegramAuthHeaders } from "./telegramAuth";
const API_ORIGIN = "https://tma-advent.brand-games.ru";

export type CheckSubscriptionResponse = {
  success: boolean;
  subs: boolean;
};

export const checkUserSubscription = async (
  userId: number | string,
): Promise<CheckSubscriptionResponse> => {
  const response = await fetch(`${API_ORIGIN}/api/days/<YYYY-MM-DD>/check-sub`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
       ...getTelegramAuthHeaders(),
    },
    body: JSON.stringify({
      user_id: Number(userId),
    }),
  });

  if (!response.ok) {
    throw new Error(`POST /api/check_subscription/ → HTTP ${response.status}`);
  }

  const data: CheckSubscriptionResponse = await response.json();

  useAppStore.getState().setUserSubs(data.subs);

  return data;
};