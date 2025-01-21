export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    password: string;
    role: string;
}

export interface LoginResponse {
    token: string;
}

export interface RegisterResponse {
    token: string;
}

