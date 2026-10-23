import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import DefaultLayout from "../../theme/DefaultLayout";
import { Language, privacyContent } from "./privacyContent";

// Turn emails and URLs inside the text into links. split() with a capture
// group puts the matches at the odd indices.
const LINK_PATTERN = /(\S+@\S+\.[a-z]{2,}|https?:\/\/\S+)/;

const withLinks = (text: string): React.ReactNode[] =>
  text.split(LINK_PATTERN).map((part, i) => {
    if (i % 2 === 0) {
      return part;
    }
    const href = part.includes("@") ? `mailto:${part}` : part;
    return (
      <Link
        key={i}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        {part}
      </Link>
    );
  });

const initialLanguage = (): Language =>
  navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";

const PrivacyPage: React.FC = () => {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const content = privacyContent[language];

  return (
    <DefaultLayout>
      {/* One container: DefaultLayout lays children out as flex columns on md+ */}
      <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", py: 3 }}>
        <Card>
          <CardContent lang={language}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="h4" component="h1">
                  {content.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {content.updated}
                </Typography>
              </Box>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={language}
                onChange={(_, value: Language | null) =>
                  value && setLanguage(value)
                }
                aria-label="Language / Sprache"
              >
                <ToggleButton value="de">Deutsch</ToggleButton>
                <ToggleButton value="en">English</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {content.sections.map((section) => (
              <Box component="section" key={section.heading} sx={{ mt: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {section.heading}
                </Typography>
                {section.blocks.map((block, i) =>
                  Array.isArray(block) ? (
                    <Box component="ul" key={i} sx={{ mt: 0, pl: 3 }}>
                      {block.map((item) => (
                        <Typography component="li" variant="body1" key={item}>
                          {withLinks(item)}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="body1"
                      component="p"
                      sx={{ mb: 2 }}
                      key={i}
                    >
                      {withLinks(block)}
                    </Typography>
                  ),
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </DefaultLayout>
  );
};

export default PrivacyPage;
