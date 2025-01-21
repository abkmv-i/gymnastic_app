import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RegisterRequest, RegisterResponse } from "../models/types";

const Registration: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const registerData: RegisterRequest = { username, password, role };

    try {
      // Отправляем запрос на регистрацию
      const response = await axios.post<RegisterResponse>(
        "http://localhost:8080/auth/register",
        registerData
      );

      const { token } = response.data;
      // Сохраняем токен (если он возвращается)
      localStorage.setItem("authToken", token);
      setMessage("Register successful!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage(`Register failed: ${errorMessage}`);
    }
  };

  return (
    <div>
      <h1>Регистрация</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Можно сделать селект, если роли ограничены, 
            либо оставить input="text" */}
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />
        <button type="submit">Зарегистрироваться</button>
      </form>

      {/* Кнопка для перехода на страницу авторизации */}
      <button type="button" onClick={() => navigate("/login")}>
        Авторизоваться
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Registration;
