import React from "react";
import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/** Shown on every page, signed in or not — the privacy policy must be reachable from anywhere. */
const Footer: React.FC = () => (
  <Box
    component="footer"
    sx={{ py: 2, textAlign: "center", typography: "body2" }}
  >
    <Link component={RouterLink} to="/privacy" color="text.secondary">
      Datenschutz / Privacy
    </Link>
  </Box>
);

export default Footer;
