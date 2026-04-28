import apiClient from "./apiClient";
import { handleApiError } from "./apiErrors";

export interface LoginResponse {
  accessToken: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const params = new URLSearchParams();
  params.append("email", data.email);
  params.append("password", data.password);

  try {
    const response = await apiClient.post("/login", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post("/logout");
  } catch (error) {
    throw handleApiError(error);
  }
};

export const register = async (data: RegisterRequest): Promise<void> => {
  try {
    await apiClient.post("/register", data);
  } catch (error) {
    throw handleApiError(error);
  }
};
