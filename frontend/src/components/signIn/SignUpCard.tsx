import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { styled } from "@mui/material/styles";
import { useLayoutEffect, useState } from "react";
import Alert from "@mui/material/Alert";

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

interface SignUpCardProps {
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  email: string;
  setEmail: (email: string) => void;
  firstName: string;
  setFirstName: (firstName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  handleSignUp: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
}

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function SignUpCard({
  username,
  setUsername,
  password,
  setPassword,
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  handleSignUp,
  isLoading,
  errorMessage,
}: SignUpCardProps) {
  // Rules show as neutral hints while typing; they only turn red once the
  // user has left the field
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => () =>
    setTouched((t) => ({ ...t, [field]: true }));
  const usernameInvalid =
    !!touched.username && username.length < MIN_USERNAME_LENGTH;
  const emailInvalid =
    !!touched.email && email.length > 0 && !EMAIL_PATTERN.test(email);
  const passwordInvalid =
    !!touched.password && password.length < MIN_PASSWORD_LENGTH;

  useLayoutEffect(() => {
    if (isLoading && process.env.NODE_ENV === "development") {
      console.log("Loading...");
    }
  }, [isLoading]);

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <img
          src="/ConcertJournal_logo.png"
          alt="Logo"
          width={"50"}
          height={"50"}
        />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Sign up
      </Typography>
      <Box
        component="form"
        onSubmit={handleSignUp}
        noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
        onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSignUp(event as React.FormEvent<HTMLFormElement>);
          }
        }}
      >
        <FormControl>
          <FormLabel htmlFor="username">Username</FormLabel>
          <TextField
            error={usernameInvalid}
            helperText={`At least ${MIN_USERNAME_LENGTH} characters`}
            id="username"
            type="text"
            name="username"
            placeholder="yourusername"
            autoComplete="username"
            autoFocus
            required
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={touch("username")}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <TextField
            id="firstName"
            type="text"
            name="firstName"
            placeholder="John"
            autoComplete="given-name"
            required
            fullWidth
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <TextField
            id="lastName"
            type="text"
            name="lastName"
            placeholder="Doe"
            autoComplete="family-name"
            required
            fullWidth
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={emailInvalid}
            helperText={
              emailInvalid ? "Please enter a valid email address." : ""
            }
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={touch("email")}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password">Password</FormLabel>
          <TextField
            error={passwordInvalid}
            helperText={`At least ${MIN_PASSWORD_LENGTH} characters`}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="new-password"
            required
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={touch("password")}
          />
        </FormControl>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Sign up"}
        </Button>
        <Typography sx={{ textAlign: "center" }}>
          Already have an account?{" "}
          <span>
            <Link href="/sign-in" variant="body2" sx={{ alignSelf: "center" }}>
              Sign in
            </Link>
          </span>
        </Typography>
      </Box>
    </Card>
  );
}
