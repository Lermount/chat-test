const API_URL = "https://api.green-api.com";

export const checkInstance = async (credentials) => {
  const { idInstance, apiToken } = credentials;
  const url = `${API_URL}/waInstance${idInstance}/getStateInstance/${apiToken}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return false;
    }

    const data = await response.json();
    return data.stateInstance !== undefined;
  } catch (error) {
    console.error("Ошибка проверки инстанса:", error);
    return false;
  }
};

export const sendMessage = async (credentials, phone, text) => {
  const { idInstance, apiToken } = credentials;
  const chatId = `${phone}@c.us`;
  const url = `${API_URL}/waInstance${idInstance}/sendMessage/${apiToken}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId: chatId,
      message: text,
    }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const textError = await response.text();
    console.error("Прокси вернул HTML вместо JSON:", textError);
    throw new Error("Ошибка сети/прокси. Проверь консоль.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Ошибка отправки сообщения");
  }

  return data;
};

export const receiveNotification = async (credentials) => {
  const { idInstance, apiToken } = credentials;
  const url = `${API_URL}/waInstance${idInstance}/receiveNotification/${apiToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }
    const textData = await response.text();

    if (!textData || textData.trim() === "") {
      return null;
    }
    const data = JSON.parse(textData);
    if (!data || !data.body) return null;

    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const deleteNotification = async (credentials, receiptId) => {
  const { idInstance, apiToken } = credentials;
  const url = `${API_URL}/waInstance${idInstance}/deleteNotification/${apiToken}/${receiptId}`;

  try {
    const response = await fetch(url, { method: "DELETE" });
    return response.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
};
