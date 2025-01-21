import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginRequest, LoginResponse } from "../models/types";
import "../App.css"

const Authorization: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginData: LoginRequest = {
      username,
      password,
    };

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:8080/auth/login",
        loginData
      );

      const { token } = response.data;

      localStorage.setItem("authToken", token);

      setMessage("Авторизация прошла успешно!");

      navigate("/");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage(`Ошибка авторизации: ${errorMessage}`);
    }
  };

  return (
    <div className="home-page">
      <h1>Авторизация</h1>
      <form onSubmit={handleLogin}>
        <input
          className="login"
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="login"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Войти</button>
      </form>

      <button type="button" onClick={() => navigate("/register")}>
        Зарегистрироваться
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Authorization;
