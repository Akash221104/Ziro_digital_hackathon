// src/lib/api.ts
/** Simple API client wrapper for the negotiation backend */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return (await res.json()) as T;
}

export const getNegotiations = () =>
  apiRequest<{ negotiations: any[] }>("/api/negotiations");

export const createNegotiation = (payload: any) =>
  apiRequest<any>("/api/negotiations", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getNegotiationPublic = (id: string) =>
  apiRequest<any>(`/api/negotiations/${id}/public`);

export const getNegotiationInternal = (id: string) =>
  apiRequest<any>(`/api/negotiations/${id}`);

export const postMessage = (id: string, message: string) =>
  apiRequest<any>(`/api/negotiations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

export const submitApproval = (
  id: string,
  data: { decision: string; approvedOffer?: number; reviewerNote?: string }
) =>
  apiRequest<any>(`/api/negotiations/${id}/approval`, {
    method: "POST",
    body: JSON.stringify(data),
  });
