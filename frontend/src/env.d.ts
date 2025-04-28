/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // добавьте другие переменные окружения, которые вы используете
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }