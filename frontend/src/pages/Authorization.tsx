import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginRequest, LoginResponse } from "../models/types";

const Authorization: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Хук для навигации
  const navigate = useNavigate();

  // Обработчик отправки формы
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Данные, которые отправляем на сервер
    const loginData: LoginRequest = {
      username,
      password,
    };

    try {
      // Запрос на /auth/login
      const response = await axios.post<LoginResponse>(
        "http://localhost:8080/auth/login",
        loginData
      );

      // Предполагаем, что сервер возвращает объект { token: "..." }
      const { token } = response.data;

      // Сохраняем токен в localStorage
      localStorage.setItem("authToken", token);

      // Выводим сообщение об успехе
      setMessage("Авторизация прошла успешно!");

      // Переходим на главную страницу ("/")
      navigate("/");
    } catch (error: any) {
      // Если сервер вернул ошибку, получаем сообщение
      const errorMessage = error.response?.data?.message || error.message;
      setMessage(`Ошибка авторизации: ${errorMessage}`);
    }
  };

  return (
    <div>
      <h1>Авторизация</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Войти</button>
      </form>

      {/* Кнопка для перехода на страницу регистрации */}
      <button type="button" onClick={() => navigate("/register")}>
        Зарегистрироваться
      </button>

      {/* Сообщение об ошибке или успехе */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Authorization;
