import React, { useContext, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../theme/DefaultLayout";
import AccountApi from "../../api/apiAccount";
import useAuth from "../../hooks/useAuth";
import { AuthContext } from "../../contexts/AuthContext";
import { ApiError } from "../../api/apiErrors";

const MIN_PASSWORD_LENGTH = 8;

type Feedback = { severity: "success" | "error"; text: string } | null;

const section = (title: string, children: React.ReactNode) => (
  <Card sx={{ width: "100%" }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const SettingsPage: React.FC = () => {
  const accountApi = AccountApi();
  const { token } = useAuth();
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  const [exportFeedback, setExportFeedback] = useState<Feedback>(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordFeedback(null);
    const errors: Record<string, string> = {};
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setBusy(true);
    try {
      await accountApi.changePassword({ currentPassword, newPassword }, token);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFeedback({ severity: "success", text: "Password changed." });
    } catch (error) {
      const apiError = error as ApiError;
      setPasswordErrors(apiError.details || {});
      setPasswordFeedback({ severity: "error", text: apiError.message });
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    setExportFeedback(null);
    setBusy(true);
    try {
      const data = await accountApi.exportData(token);
      const day = new Date().toISOString().slice(0, 10);
      downloadJson(data, `concertjournal-export-${day}.json`);
      setExportFeedback({
        severity: "success",
        text: `Exported ${data.events.length} entries.`,
      });
    } catch (error) {
      setExportFeedback({
        severity: "error",
        text: (error as ApiError).message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await accountApi.deleteAccount(deletePassword, token);
      setConfirmOpen(false);
      authContext?.setLoggedOut();
      navigate("/sign-in");
    } catch (error) {
      setConfirmOpen(false);
      const apiError = error as ApiError;
      setDeleteError(apiError.details?.password || apiError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DefaultLayout>
      {/* One container: DefaultLayout lays children out as flex columns on md+ */}
      <Box sx={{ width: "100%", maxWidth: 640, mx: "auto", py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account settings
        </Typography>
        <Stack spacing={3}>
          {section(
            "Change password",
            <Box component="form" onSubmit={handleChangePassword} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  required
                />
                <TextField
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={!!passwordErrors.newPassword}
                  helperText={
                    passwordErrors.newPassword ||
                    `At least ${MIN_PASSWORD_LENGTH} characters`
                  }
                  required
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  required
                />
                {passwordFeedback && (
                  <Alert severity={passwordFeedback.severity}>
                    {passwordFeedback.text}
                  </Alert>
                )}
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={busy || !currentPassword || !newPassword}
                  >
                    Change password
                  </Button>
                </Box>
              </Stack>
            </Box>,
          )}

          {section(
            "Export your data",
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Download your profile and all journal entries as a JSON file.
              </Typography>
              {exportFeedback && (
                <Alert severity={exportFeedback.severity}>
                  {exportFeedback.text}
                </Alert>
              )}
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleExport}
                  disabled={busy}
                >
                  Download my data
                </Button>
              </Box>
            </Stack>,
          )}

          {section(
            "Delete account",
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Permanently deletes your account and every journal entry. This
                cannot be undone — export your data first if you want to keep
                it.
              </Typography>
              <TextField
                label="Confirm with your password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError("");
                }}
                error={!!deleteError}
                helperText={deleteError}
              />
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  disabled={busy || !deletePassword}
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete account
                </Button>
              </Box>
            </Stack>,
          )}
        </Stack>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account and all journal entries will be deleted permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} disabled={busy}>
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>
    </DefaultLayout>
  );
};

export default SettingsPage;
