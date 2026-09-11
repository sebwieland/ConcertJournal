import useApiClient from "./apiClient";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";
import { handleApiError } from "./apiErrors";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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

const useAuthApi = () => {
  const { rootClient } = useApiClient();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not provided");
  }
  const { csrfToken } = authContext;

  const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append("email", data.email);
    params.append("password", data.password);

    try {
      const response = await rootClient.post("/login", params.toString(), {
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw handleApiError(new Error(response.statusText));
      }
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const response = await rootClient.post("/logout", null, {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (response.status !== 200) {
        throw handleApiError(new Error(response.statusText));
      }
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const register = async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await rootClient.post("/register", data, {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  return { login, register, logout };
};

export default useAuthApi;
