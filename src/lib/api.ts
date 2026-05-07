export type ApiResponse = {
  ok: boolean;
  message: string;
  id?: string;
};

export async function postJson(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({
    ok: false,
    message: 'The server returned an unreadable response.',
  }))) as ApiResponse;

  if (!response.ok) {
    throw new Error(data.message || 'Request failed. Please try again.');
  }

  return data;
}
