# Security Headers Configuration

This document describes the configurable OWASP security headers for ConcertJournal.

## Header Configuration

All security headers can be configured via `application.properties`:

### HSTS (HTTP Strict Transport Security)

| Property | Default | Dev | Production |
|----------|---------|-----|------------|
| `security.headers.hsts.enabled` | `true` | `false` | `true` |
| `security.headers.hsts.max-age-seconds` | `31536000` (1 year) | (disabled) | `true` |
| `security.headers.hsts.include-sub-domains` | `true` | (disabled) | `true` |
| `security.headers.hsts.preload` | `true` | (disabled) | `true` |

**Recommendation**: Enable HSTS in production, disable in development (HTTP connections)

### CSP (Content Security Policy)

| Property | Default | Dev | Production |
|----------|---------|-----|------------|
| `security.headers.csp.enabled` | `true` | `true` | `true` |
| `security.headers.csp.policy` | Allows same-origin | Allows `http://localhost:3000` | Allows same-origin only |

**Dev policy**: Includes `http://localhost:3000` for local React development
**Production policy**: Restricts to `https://concertjournal.de` domains only

### X-Frame-Options

| Property | Default | Dev | Production |
|----------|---------|-----|------------|
| `security.headers.x-frame-options.enabled` | `true` | `true` | `true` |
| `security.headers.x-frame-options.policy` | `SAMEORIGIN` | `SAMEORIGIN` | `SAMEORIGIN` |

**Options**: `SAMEORIGIN`, `DENY`

### Referrer-Policy

| Property | Default | Dev | Production |
|----------|---------|-----|------------|
| `security.headers.referrer-policy.enabled` | `true` | `true` | `true` |
| `security.headers.referrer-policy.policy` | `STRICT_ORIGIN_WHEN_CROSS_ORIGIN` | `STRICT_ORIGIN_WHEN_CROSS_ORIGIN` | `STRICT_ORIGIN_WHEN_CROSS_ORIGIN` |

**Options**: `NO-REFERRER`, `SAME-ORIGIN`, `ORIGIN`, `ORIGIN-WHEN-CROSS-ORIGIN`, `UNSAFE-URL`, `STRICT_ORIGIN_WHEN_CROSS_ORIGIN`

### Permissions-Policy

| Property | Default | Dev | Production |
|----------|---------|-----|------------|
| `security.headers.permissions-policy.enabled` | `true` | `true` | `true` |
| `security.headers.permissions-policy.policy` | All disabled | All disabled | All disabled |

**Current policy**: Disables geolocation, microphone, camera, payment, USB, magnetometer, gyroscope

## Usage in dev vs production

### Development (application-dev.properties)
- HSTS: **Disabled** (development often uses HTTP)
- CSP: Allows `http://localhost:3000`
- Other headers: Same as production

### Production (application.properties)
- HSTS: **Enabled** (required for HTTPS)
- CSP: Strict same-origin policy
- Other headers: Full security headers

## Testing Security Headers

```bash
# Check headers are properly configured
curl -I https://api.concertjournal.de

# Should see:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: SAMEORIGIN
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: geolocation=(), microphone=(), ...
```

## Security Score Impact

These headers contribute to a high security score on tools like:
- OWASP ZAP
- Security Headers scanner (securityheaders.com)
- Mozilla Observatory
- Lighthouse Security Audit

## Additional Recommendations

1. **HSTS Preload**: Submit domain to `https://hstspreload.org/` once in production
2. **CSP Reporting**: Consider adding `report-uri` for CSP violations
3. **Custom Headers**: Add additional headers as needed:
   - `X-Content-Type-Options: nosniff` (automatically included by Spring Security)
   - `X-XSS-Protection: 1; mode=block` (automatically included by Spring Security)

## Disabling Headers for Testing

To disable a specific header in certain environments:

```properties
# Example: Disable HSTS in dev
security.headers.hsts.enabled=false

# Example: Disable CSP temporarily
security.headers.csp.enabled=false
```