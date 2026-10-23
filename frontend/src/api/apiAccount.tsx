import useApiClient from "./apiClient";
import { ConcertEvent } from "../types/events";
import { handleApiError } from "./apiErrors";

export interface AccountExport {
  email: string;
  firstName: string | null;
  lastName: string | null;
  memberSince: string | null;
  exportedAt: string;
  events: ConcertEvent[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

const AccountApi = () => {
  const apiClient = useApiClient().apiClient;

  const exportData = async (token: string): Promise<AccountExport> => {
    try {
      const response = await apiClient.get("/me/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const changePassword = async (
    data: ChangePasswordData,
    token: string,
  ): Promise<void> => {
    try {
      await apiClient.put("/me/password", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const deleteAccount = async (
    password: string,
    token: string,
  ): Promise<void> => {
    try {
      await apiClient.delete("/me", {
        data: { password },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  };

  return { exportData, changePassword, deleteAccount };
};

export default AccountApi;
