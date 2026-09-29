import React, { JSX } from "react";
import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string;
  icon: JSX.Element;
  /** Optional SPA route — when set, the card becomes a clickable link */
  linkTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, linkTo }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const card = (
    <Card
      sx={{
        margin: "12px",
        width: "270px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isDark
            ? "0 8px 24px rgba(0, 0, 0, 0.4)"
            : "0 8px 24px rgba(79, 70, 229, 0.12)",
        },
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "14px",
            flexShrink: 0,
            color: isDark
              ? theme.palette.primary.light
              : theme.palette.primary.dark,
            backgroundColor: isDark
              ? "rgba(129, 140, 248, 0.14)"
              : "rgba(79, 70, 229, 0.10)",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (!linkTo) {
    return card;
  }
  return (
    <Link
      to={linkTo}
      style={{ textDecoration: "none", color: "inherit" }}
      aria-label={`${title}: ${value}`}
    >
      {card}
    </Link>
  );
};

export default StatCard;
