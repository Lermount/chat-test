import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import MaxLogo from "./MaxLogo";
import { checkInstance } from "../api/greenApi";

export default function AuthForm({ onLogin }) {
  const [idInstance, setIdInstance] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanId = idInstance.trim();
    const cleanToken = apiToken.trim();

    if (!cleanId || !cleanToken) {
      setError("Заполните оба поля");
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(cleanId)) {
      setError("idInstance должен состоять только из цифр");
      setIsLoading(false);
      return;
    }

    if (/\s/.test(cleanToken)) {
      setError("apiTokenInstance не должен содержать пробелов");
      setIsLoading(false);
      return;
    }

    const creds = { idInstance: cleanId, apiToken: cleanToken };

    try {
      const isValid = await checkInstance(creds);

      if (!isValid) {
        setError("Неверный idInstance или apiTokenInstance. Проверьте данные.");
        setIsLoading(false);
        return;
      }
      localStorage.setItem("green_api_id", creds.idInstance);
      localStorage.setItem("green_api_token", creds.apiToken);
      onLogin(creds);
    } catch (err) {
      setError("Ошибка соединения с сервером GREEN-API." + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-max-bg p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <MaxLogo className="w-16 h-16 drop-shadow-md" />
          </div>
          <CardTitle className="text-2xl">Вход в GREEN-API</CardTitle>
          <CardDescription>
            Введите данные из личного кабинета GREEN-API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                idInstance
              </label>
              <Input
                placeholder="1101000000"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                apiTokenInstance
              </label>
              <Input
                type="password"
                placeholder="Ваш токен"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-max-primary to-max-secondary hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Проверка..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
