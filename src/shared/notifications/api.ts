import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";

/** Device platform (backend Platform enum). Back-office is always WEB. */
export type Platform = "IOS" | "ANDROID" | "WEB";

/** DeviceResponse (`GET /me/devices`). */
export interface Device {
  token: string;
  platform: Platform;
}

const mockStore: Device[] = [];

/** Register / upsert this device's FCM token (`POST /me/devices`). */
export function registerDevice(token: string, platform: Platform = "WEB"): Promise<void> {
  if (USE_MOCK_API) {
    if (!mockStore.some((d) => d.token === token)) mockStore.push({ token, platform });
    return mockDelay(undefined);
  }
  return apiRequest<void>("/me/devices", {
    method: "POST",
    body: { token, platform },
  });
}

/** List this user's registered devices (`GET /me/devices`). */
export function listDevices(): Promise<Device[]> {
  if (USE_MOCK_API) return mockDelay([...mockStore]);
  return apiRequest<Device[]>("/me/devices");
}

/** Unregister a device token (`DELETE /me/devices/{token}`). */
export function deleteDevice(token: string): Promise<void> {
  if (USE_MOCK_API) {
    const i = mockStore.findIndex((d) => d.token === token);
    if (i >= 0) mockStore.splice(i, 1);
    return mockDelay(undefined);
  }
  return apiRequest<void>(`/me/devices/${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
}
