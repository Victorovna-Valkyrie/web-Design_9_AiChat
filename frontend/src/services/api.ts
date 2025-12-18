const API_BASE_URL = 'http://localhost:9010';

export interface ChatRoom {
  id: number;
  name?: string;
}

export async function sendMessage(roomId: number, userPrompt: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/${roomId}/chat?userPrompt=${encodeURIComponent(userPrompt)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getChatRoomList(): Promise<ChatRoom[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw error;
  }
}