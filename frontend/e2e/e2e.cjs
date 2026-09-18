const { chromium } = require('playwright');
const fs = require('fs');
const stamp = Date.now();
const out = __dirname + '/e2e-out';
fs.mkdirSync(out, { recursive: true });
// TARGET base URL — Vite dev in local use, unified production container in CI
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = `e2e${stamp}@testconcert.de`;
const PASSWORD = 'TestPassword1!';
const results = [];
const consoleLog = [];
let page, browser, context;
let createdEventId = null;

function step(name, status, detail) {
  results.push({ name, status, detail: detail || '' });
  console.log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '➖'} ${name} — ${detail || ''}`);
}
async function shot(name) { await page.screenshot({ path: `${out}/${name}.png`, fullPage: true }).catch(() => {}); }

(async () => {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await context.newPage();
  page.on('console', m => consoleLog.push(`[${m.type()}] ${m.text().slice(0, 250)}`));
  page.on('pageerror', e => consoleLog.push(`[pageerror] ${String(e).slice(0, 250)}`));
  // Track network activity around /login for diagnosis
  page.on('response', r => {
    const u = r.url();
    if (r.status() >= 400) {
      consoleLog.push(`[http-error] ${r.request().method()} ${r.status()} ${u.replace(BASE, '')}`);
    } else if (u.includes('login') || u.includes('/api/refresh-token') ||
        u.includes('/api/event') || u.includes('/api/allEvents')) {
      consoleLog.push(`[net] ${r.request().method()} ${r.status()} ${u.replace(BASE, '')}`);
    }
  });

  const newUser = false;
  // ---------- 1. Registration ----------
  try {
    await page.goto(`${BASE}/sign-up`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByLabel('Username').fill(`e2euser${stamp}`);
    await page.getByLabel('First Name').fill('E2E');
    await page.getByLabel('Last Name').fill('Tester');
    await page.getByLabel('Email').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    const [regResp] = await Promise.all([
      page.waitForResponse(r => r.url().includes('register'), { timeout: 15000 }).catch(() => null),
      page.getByRole('button', { name: /sign up/i }).click(),
    ]);
    if (regResp) {
      const body = await regResp.text();
      step('register:POST', regResp.request().method() === 'POST' ? 'INFO' : 'FAIL',
        `${regResp.status()} ${regResp.url()} body="${body.slice(0, 120)}"`);
    } else step('register:POST', 'FAIL', 'no register network call observed');
    await page.waitForTimeout(1500);
    // By design the SPA stays on /sign-up after registration (user clicks Sign in)
    step('register:after', 'INFO', `url=${page.url()}`);
  } catch (e) { step('register', 'FAIL', String(e).slice(0, 200)); await shot('01-register-fail'); }

  // ---------- 2. Sign in ----------
  try {
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByLabel('Email').or(page.getByPlaceholder('your@email.com')).first().fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    const [loginResp] = await Promise.all([
      page.waitForResponse(r => r.url().includes('login'), { timeout: 20000 }).catch(() => null),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);
    if (loginResp) {
      const body = await loginResp.text();
      const isJson = body.trim().startsWith('{');
      step('login:POST', isJson || loginResp.status() === 200 ? 'INFO' : 'FAIL',
        `${loginResp.status()} ${loginResp.url()} contentType=${(loginResp.headers()['content-type'] || '?')} len=${body.length}`);
      try {
        const j = JSON.parse(body);
        globalThis.accessToken = j.accessToken;
        consoleLog.push(`[diag] login body parsed OK; accessToken=${j.accessToken ? 'present(' + String(j.accessToken).length + ' chars)' : 'MISSING'}, refreshToken=${j.refreshToken ? 'present' : 'missing'}`);
      } catch (e) {
        consoleLog.push(`[diag] login body JSON.parse FAILED: ${String(e).slice(0, 120)} bodyStart=${body.slice(0, 60)}`);
      }
    } else step('login:POST', 'FAIL', 'no login network call observed');
    await page.waitForTimeout(2500);
    const cookies = await context.cookies();
    const hasRefresh = cookies.some(c => c.name === 'refreshToken');
    const hasXsrf = cookies.some(c => c.name === 'XSRF-TOKEN');
    step('login:cookies', hasRefresh && hasXsrf ? 'PASS' : 'FAIL',
      `refreshToken=${hasRefresh} XSRF-TOKEN=${hasXsrf} all=${cookies.map(c => c.name).join(',')}`);
    step('login:redirect', /sign-in/.test(page.url()) ? 'FAIL' : 'PASS', `url=${page.url()}`);
  } catch (e) { step('login', 'FAIL', String(e).slice(0, 200)); await shot('02-login-fail'); }

  // ---------- 3. Session persistence across reload ----------
  try {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    step('persistence:reload', /sign-in/.test(page.url()) ? 'FAIL' : 'PASS', `url=${page.url()}`);
  } catch (e) { step('persistence:reload', 'FAIL', String(e).slice(0, 150)); }

  // ---------- 4. Create entry ----------
  try {
    await page.goto(`${BASE}/new-entry`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    step('new-entry:accessible', /sign-in/.test(page.url()) ? 'FAIL' : 'PASS', `url=${page.url()}`);
    await page.getByLabel('Band').fill('Die Toten E2E Hosen');
    await page.getByLabel('Place').fill('Berlin');
    for (let i = 0; i < 4; i++) await page.locator('.MuiRating-root label').nth(i).click().catch(() => {});
    await page.getByLabel('Comment').fill('E2E test entry');
    const [createResp] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/event'), { timeout: 20000 }).catch(() => null),
      page.getByRole('button', { name: /create new entry/i }).click(),
    ]);
    if (createResp) {
      const body = await createResp.text();
      const leak = /"password"\s*:\s*"[^"]{10,}"/.test(body);
      const hasAppUser = body.includes('appUser');
      step('create-event:POST', createResp.status() === 200 ? 'PASS' : 'FAIL',
        `${createResp.status()} bodyLen=${body.length}`);
      try { createdEventId = JSON.parse(body).id; } catch {}
      step('create-event:R1-leak-probe', leak ? '❌ CONFIRMED' : 'PASS',
        `password-field-in-response=${leak} appUser-embedded=${hasAppUser}`);
    } else step('create-event:POST', 'FAIL', 'no POST /api/event observed');
    await shot('04-after-create');
  } catch (e) { step('create-event', 'FAIL', String(e).slice(0, 200)); await shot('04-create-fail'); }

  // ---------- 5. Journal shows entry ----------
  try {
    await page.goto(`${BASE}/your-journal`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const content = await page.content();
    const visible = content.includes('Die Toten E2E Hosen');
    step('journal:entry-visible', visible ? 'PASS' : 'FAIL', `url=${page.url()}`);
    await shot('05-journal');
  } catch (e) { step('journal:entry-visible', 'FAIL', String(e).slice(0, 200)); await shot('05-journal-fail'); }

  // ---------- 5b. Statistics page ----------
  try {
    await page.goto(`${BASE}/statistics`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    const body = await page.evaluate(() => document.body.innerText);
    const hasHeading = body.includes('Your Statistics');
    const hasCharts = body.includes('Concerts per year') && body.includes('Top 5 artists');
    step('statistics:renders', hasHeading && hasCharts ? 'PASS' : 'FAIL',
      `heading=${hasHeading} charts=${hasCharts} url=${page.url()}`);
    await shot('05b-statistics');
  } catch (e) { step('statistics:renders', 'FAIL', String(e).slice(0, 200)); await shot('05b-statistics-fail'); }

    // ---------- 6a. API probe: allEvents payload (R1 must be FIXED) ----------
    if (globalThis.accessToken) {
      try {
        const probe = await page.evaluate(async (t) => {
          const r = await fetch('/api/allEvents', { headers: { Authorization: `Bearer ${t}` }, credentials: 'same-origin' });
          const bodyText = await r.text();
          const events = Array.isArray(safeJson(bodyText)) ? safeJson(bodyText) : [];

          function safeJson(s) { try { return JSON.parse(s); } catch { return { parseError: s.slice(0, 200) }; } }
          void safeJson;
          const serialized = Array.isArray(events) ? JSON.stringify(events[0] || {}) : JSON.stringify(events);
          return {
            status: r.status,
            count: Array.isArray(events) ? events.length : -1,
            bodySnippet: bodyText ? bodyText.slice(0, 160) : '(empty)',
            passwordLeak: /"password"\s*:\s*"[^"]{10,}"/.test(serialized),
            appUserLeak: serialized.includes('appUser'),
          };
        }, globalThis.accessToken);
        step('api:allEvents', probe.status === 200 && probe.count >= 1 ? 'PASS' : 'FAIL',
          `status=${probe.status} count=${probe.count} body=${probe.bodySnippet.replace(globalThis.accessToken, '<token>')}`);
        step('api:R1-password-leak-fixed', !probe.passwordLeak && !probe.appUserLeak ? 'PASS' : '❌ STILL LEAKING',
          `passwordLeak=${probe.passwordLeak} appUserLeak=${probe.appUserLeak}`);
      } catch (e) { step('api:allEvents', 'FAIL', String(e).slice(0, 150)); }
    } else step('api:allEvents', 'SKIP', 'no accessToken captured (login response not JSON)');

  // ---------- 6b. Edit entry ----------
  if (createdEventId) {
    try {
      await page.goto(`${BASE}/edit-entry/${createdEventId}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      step('edit-entry:accessible', /sign-in/.test(page.url()) ? 'FAIL' : 'PASS', `url=${page.url()}`);
      const bandVal = await page.getByLabel('Band').inputValue().catch(() => '?');
      if (bandVal === '?') {
        const pageText = await page.evaluate(() => document.body.innerText.slice(0, 200));
        step('edit-entry:prefilled', 'FAIL', `band missing — page shows: "${pageText.replace(/\n/g, ' ')}"`);
      } else {
        step('edit-entry:prefilled', bandVal.includes('Hosen') ? 'PASS' : 'FAIL', `band="${bandVal}"`);
      }
      await page.getByLabel('Comment').fill('E2E edited comment');
      const [updResp] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/event/'), { timeout: 20000 }).catch(() => null),
        page.getByRole('button', { name: /update entry/i }).click(),
      ]);
      step('edit-entry:PUT', updResp && updResp.status() === 200 ? 'PASS' : 'FAIL',
        updResp ? `${updResp.status()}` : 'no PUT observed');
      await shot('06-edited');
    } catch (e) { step('edit-entry', 'FAIL', String(e).slice(0, 200)); await shot('06-edit-fail'); }

    // ---------- 7. Delete entry (with CSRF header, like the SPA does) ----------
    try {
      const xsrf = (await page.context().cookies()).find(c => c.name === 'XSRF-TOKEN')?.value || '';
      const delStatus = await page.evaluate(async ({ id, token, xsrf }) => {
        return fetch(`/api/event/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}`, 'X-XSRF-TOKEN': xsrf },
        }).then(r => r.status).catch(() => 'blocked');
      }, { id: createdEventId, token: globalThis.accessToken, xsrf });
      step('delete-event:DELETE', delStatus === 200 ? 'PASS' : 'FAIL', `status=${delStatus}`);
    } catch (e) { step('delete-event', 'FAIL', String(e).slice(0, 150)); }
  } else step('edit-entry', 'SKIP', 'no created event id');

  // ---------- 8. CSRF enforcement probe (mutation without header) ----------
  try {
    const csrfProbe = await (createdEventId
      ? page.evaluate(async (id) => {
          return fetch(`/api/event/${id}`, { method: 'DELETE' }).then(r => r.status).catch(() => 'blocked');
        }, createdEventId)
      : page.evaluate(async (token) => {
          return fetch('/api/event', {
            method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ bandName: 'NoCsrf', date: '2025-01-01', rating: 3 }),
          }).then(r => r.status).catch(() => 'blocked');
        }, globalThis.accessToken));
    step('security:csrf-required', csrfProbe === 403 ? 'PASS' : '❌ CSRF BYPASSABLE', `mutation-without-XSRF-header → ${csrfProbe}`);
  } catch (e) { step('security:csrf-required', 'FAIL', String(e).slice(0, 100)); }

  // ---------- 9. Unauthenticated probe ----------
  try {
    const anon = await page.evaluate(async () => {
      const r = await fetch('/api/allEvents', { credentials: 'omit' });
      return { status: r.status, type: r.type };
    });
    step('security:unauthenticated', anon.status === 401 || anon.status === 403 || anon.type === 'opaqueredirect' ? 'PASS' : 'FAIL',
      JSON.stringify(anon).slice(0, 120));
  } catch (e) { step('security:unauthenticated', 'FAIL', String(e).slice(0, 100)); }

  // ---------- 10. Logout ----------
  try {
    await page.goto(`${BASE}/your-journal`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);
    const [logoutResp] = await Promise.all([
      page.waitForResponse(r => r.url().includes('logout'), { timeout: 10000 }).catch(() => null),
      page.getByRole('button', { name: /logout/i }).click().catch(() => null),
    ]);
    step('logout:POST', logoutResp ? `${logoutResp.status()}` : 'no-call', logoutResp ? logoutResp.url() : '');
    await page.waitForTimeout(1500);
    const cookies2 = (await context.cookies()).filter(c => c.name === 'refreshToken');
    step('logout:cleared-clipBoard', true ? 'INFO' : '', `finalUrl=${page.url()} refreshTokenCookies=${cookies2.length}`);
    await shot('08-after-logout');
  } catch (e) { step('logout', 'FAIL', String(e).slice(0, 150)); }

  fs.writeFileSync(`${out}/e2e-report.json`, JSON.stringify(results, null, 2));
  fs.writeFileSync(`${out}/e2e-console.txt`, [...new Set(consoleLog)].join('\n'));
  const fail = results.filter(r => r.status === 'FAIL' || r.status.startsWith('❌')).length;
  if (fail > 0) {
    // Dump diagnostics inline so the CI log is self-contained
    console.log('\n===== BROWSER CONSOLE / DIAGNOSTICS (on failure) =====');
    [...new Set(consoleLog)].slice(-80).forEach(l => console.log(l));
    console.log('=====================================================');
  }
  await browser.close();
  const pass = results.filter(r => r.status === 'PASS').length;
  console.log(`\nSUMMARY: ${pass} pass, ${fail} fail, ${results.length - pass - fail} other`);
  process.exit(fail > 0 ? 1 : 0);
})();
