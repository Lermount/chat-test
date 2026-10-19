import { useState } from "react";
import AuthForm from "./components/AuthForm";
import ChatLayout from "./components/ChatLayout";

function App() {
  const [credentials, setCredentials] = useState(() => {
    const id = localStorage.getItem("green_api_id");
    const token = localStorage.getItem("green_api_token");
    return id && token ? { idInstance: id, apiToken: token } : null;
  });

  if (!credentials) {
    return <AuthForm onLogin={setCredentials} />;
  }

  return <ChatLayout credentials={credentials} />;
}

export default App;
