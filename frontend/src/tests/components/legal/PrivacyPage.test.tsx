import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, afterEach } from "vitest";
import { renderWithProviders } from "../../utils/test-utils";
import PrivacyPage from "../../../components/legal/PrivacyPage";
import Footer from "../../../components/legal/Footer";
import {
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  privacyContent,
} from "../../../components/legal/privacyContent";

const setBrowserLanguage = (language: string) =>
  vi.spyOn(navigator, "language", "get").mockReturnValue(language);

describe("PrivacyPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens in German for German browsers and names the controller", () => {
    setBrowserLanguage("de-DE");
    renderWithProviders(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Datenschutzerklärung" }),
    ).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CONTROLLER_NAME))).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: CONTACT_EMAIL })[0],
    ).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
  });

  it("opens in English otherwise and can switch languages", async () => {
    setBrowserLanguage("en-US");
    renderWithProviders(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Deutsch" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Datenschutzerklärung" }),
    ).toBeInTheDocument();
  });

  it("discloses the MusicBrainz transfer with a link to its policy", () => {
    setBrowserLanguage("en-US");
    renderWithProviders(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { name: /MusicBrainz/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "https://metabrainz.org/privacy" }),
    ).toHaveAttribute("target", "_blank");
  });

  it("keeps both languages structurally in sync", () => {
    // Guards against updating one language and forgetting the other
    const shape = (lang: "de" | "en") =>
      privacyContent[lang].sections.map((s) =>
        s.blocks.map((b) => (Array.isArray(b) ? b.length : "p")),
      );

    expect(shape("en")).toEqual(shape("de"));
  });
});

describe("Footer", () => {
  it("links to the privacy policy", () => {
    renderWithProviders(<Footer />);

    expect(
      screen.getByRole("link", { name: "Datenschutz / Privacy" }),
    ).toHaveAttribute("href", "/privacy");
  });
});
