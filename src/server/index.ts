import 'dotenv/config';

import crypto from 'node:crypto';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express, {type NextFunction, type Request, type Response} from 'express';

type AppConfig = {
  appSecret: string;
  appUrl: string;
  corsAllowedOrigins: string[];
  dataDir: string;
  isProduction: boolean;
  host: string;
  port: number;
  stripePriceId?: string;
  stripeSecretKey?: string;
  webhookUrl?: string;
};

type ApiError = Error & {
  statusCode?: number;
  details?: unknown;
};

type LeadRecord = {
  id: string;
  type: string;
  createdAt: string;
  source: {
    ipHash: string;
    userAgent?: string;
  };
  data: Record<string, unknown>;
};

type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: UserRole;
};

type StoredUser = PublicUser & {
  passwordHash: string;
  passwordSalt: string;
};

type UserRole = 'admin' | 'customer';

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

type SubscriptionStatus = 'trialing' | 'active' | 'paused' | 'canceled' | 'pending_payment';

type StoredSubscription = {
  id: string;
  userId: string;
  plan: string;
  price: string;
  cadence: string;
  deliveryFrequency: string;
  status: SubscriptionStatus;
  billingMode: 'demo' | 'stripe';
  createdAt: string;
  updatedAt: string;
  currentPeriodEnd: string;
};

type BillingSession = {
  id: string;
  userId: string;
  plan: string;
  createdAt: string;
  mode: 'demo' | 'stripe';
  url: string;
};

type SiteContentForServer = {
  plans?: {
    items?: Array<{
      name: string;
      price: string;
      cadence: string;
    }>;
  };
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_COOKIE = 'lumina_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const config = loadConfig();
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(securityHeaders(config));
app.use(cors(config));
app.use(express.json({limit: '64kb'}));

app.get('/healthz', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'lumina-coffee-roasters',
    timestamp: new Date().toISOString(),
  });
});

app.get(
  '/api/site-content',
  asyncHandler(async (_req, res) => {
    const content = await readSiteContent();

    res
      .status(200)
      .set('Cache-Control', config.isProduction ? 'public, max-age=60' : 'no-store')
      .json({
        ok: true,
        content,
      });
  }),
);

app.get(
  '/api/auth/me',
  asyncHandler(async (req, res) => {
    const session = await getSessionUser(req);

    res.status(200).json({
      ok: true,
      user: session,
    });
  }),
);

app.post(
  '/api/auth/signup',
  asyncHandler(async (req, res) => {
    const name = requiredText(req.body.name, 'Name', 2, 80);
    const email = requiredEmail(req.body.email);
    const password = requiredPassword(req.body.password);
    const users = await readUsers();

    if (users.some((user) => user.email === email)) {
      throw conflict('An account with this email already exists.');
    }

    const passwordSalt = crypto.randomBytes(16).toString('base64url');
    const user: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role: users.length === 0 ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
      passwordSalt,
      passwordHash: await hashPassword(password, passwordSalt),
    };

    users.push(user);
    await writeUsers(users);
    setSessionCookie(res, toPublicUser(user));

    res.status(201).json({
      ok: true,
      message: 'Account created successfully.',
      user: toPublicUser(user),
    });
  }),
);

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    const email = requiredEmail(req.body.email);
    const password = requiredText(req.body.password, 'Password', 1, 200);
    const users = await readUsers();
    const user = users.find((candidate) => candidate.email === email);

    if (!user || !(await verifyPassword(password, user))) {
      throw unauthorized('Invalid email or password.');
    }

    setSessionCookie(res, toPublicUser(user));

    res.status(200).json({
      ok: true,
      message: 'Logged in successfully.',
      user: toPublicUser(user),
    });
  }),
);

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(200).json({
    ok: true,
    message: 'Logged out successfully.',
  });
});

app.get(
  '/api/saas/dashboard',
  asyncHandler(async (req, res) => {
    const user = await requireUser(req);
    const subscriptions = await readSubscriptions();

    res.status(200).json({
      ok: true,
      user: toPublicUser(user),
      subscriptions: subscriptions.filter((subscription) => subscription.userId === user.id),
    });
  }),
);

app.post(
  '/api/saas/subscriptions',
  asyncHandler(async (req, res) => {
    const user = await requireUser(req);
    const planName = requiredText(req.body.plan, 'Plan', 2, 80);
    const deliveryFrequency = requiredText(
      req.body.deliveryFrequency,
      'Delivery frequency',
      2,
      60,
    );
    const plan = await findPlan(planName);
    const subscriptions = await readSubscriptions();
    const now = new Date();

    const subscription: StoredSubscription = {
      id: crypto.randomUUID(),
      userId: user.id,
      plan: plan.name,
      price: plan.price,
      cadence: plan.cadence,
      deliveryFrequency,
      status: isStripeConfigured() ? 'pending_payment' : 'trialing',
      billingMode: isStripeConfigured() ? 'stripe' : 'demo',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      currentPeriodEnd: addDays(now, 30).toISOString(),
    };

    subscriptions.push(subscription);
    await writeSubscriptions(subscriptions);

    res.status(201).json({
      ok: true,
      message: isStripeConfigured()
        ? 'Subscription created. Complete checkout to activate billing.'
        : 'Demo subscription started. Connect Stripe keys for real billing.',
      subscription,
    });
  }),
);

app.patch(
  '/api/saas/subscriptions/:id',
  asyncHandler(async (req, res) => {
    const user = await requireUser(req);
    const action = requiredText(req.body.action, 'Action', 4, 20);
    const subscriptions = await readSubscriptions();
    const subscription = subscriptions.find((candidate) => candidate.id === req.params.id);

    if (!subscription || subscription.userId !== user.id) {
      throw notFound('Subscription not found.');
    }

    if (action === 'pause') {
      subscription.status = 'paused';
    } else if (action === 'resume') {
      subscription.status = 'active';
    } else if (action === 'cancel') {
      subscription.status = 'canceled';
    } else {
      throw badRequest('Unsupported subscription action.');
    }

    subscription.updatedAt = new Date().toISOString();
    await writeSubscriptions(subscriptions);

    res.status(200).json({
      ok: true,
      message: 'Subscription updated.',
      subscription,
    });
  }),
);

app.post(
  '/api/billing/checkout',
  asyncHandler(async (req, res) => {
    const user = await requireUser(req);
    const planName = requiredText(req.body.plan, 'Plan', 2, 80);
    const plan = await findPlan(planName);
    const session = await createBillingSession(user, plan.name);

    res.status(201).json({
      ok: true,
      message: isStripeConfigured()
        ? 'Checkout session created.'
        : 'Demo checkout session created. Add Stripe env vars for live billing.',
      checkoutUrl: session.url,
      session,
    });
  }),
);

app.post(
  '/api/billing/customer-portal',
  asyncHandler(async (req, res) => {
    const user = await requireUser(req);
    const portalUrl = `${config.appUrl}/#dashboard`;

    res.status(200).json({
      ok: true,
      message: isStripeConfigured()
        ? 'Customer portal routing is ready for Stripe integration.'
        : 'Demo customer portal opened.',
      portalUrl,
      user: toPublicUser(user),
    });
  }),
);

app.get(
  '/api/admin/metrics',
  asyncHandler(async (req, res) => {
    await requireAdmin(req);
    const users = await readUsers();
    const subscriptions = await readSubscriptions();

    res.status(200).json({
      ok: true,
      metrics: {
        users: users.length,
        activeSubscriptions: subscriptions.filter((subscription) =>
          ['active', 'trialing'].includes(subscription.status),
        ).length,
        pendingPayment: subscriptions.filter(
          (subscription) => subscription.status === 'pending_payment',
        ).length,
        contactLeads: await countJsonlRecords('contact'),
        orderRequests: await countJsonlRecords('order-request'),
        newsletterSubscribers: await countJsonlRecords('newsletter'),
      },
    });
  }),
);

app.post(
  '/api/contact',
  asyncHandler(async (req, res) => {
    const payload = {
      name: requiredText(req.body.name, 'Name', 2, 80),
      email: requiredEmail(req.body.email),
      company: optionalText(req.body.company, 100),
      message: requiredText(req.body.message, 'Message', 10, 1200),
      accountUserId: (await getSessionUser(req))?.id,
    };

    const record = await saveRecord('contact', payload, req);
    void notifyLead(record);

    res.status(201).json({
      ok: true,
      id: record.id,
      message: 'Thanks. The Lumina team will reply soon.',
    });
  }),
);

app.post(
  '/api/newsletter',
  asyncHandler(async (req, res) => {
    const payload = {
      email: requiredEmail(req.body.email),
      source: optionalText(req.body.source, 80) || 'footer',
      accountUserId: (await getSessionUser(req))?.id,
    };

    const record = await saveRecord('newsletter', payload, req);
    void notifyLead(record);

    res.status(201).json({
      ok: true,
      id: record.id,
      message: 'You are on the roast notes list.',
    });
  }),
);

app.post(
  '/api/orders',
  asyncHandler(async (req, res) => {
    const payload = {
      plan: requiredText(req.body.plan, 'Plan', 2, 80),
      name: requiredText(req.body.name, 'Name', 2, 80),
      email: requiredEmail(req.body.email),
      company: optionalText(req.body.company, 100),
      deliveryFrequency: requiredText(
        req.body.deliveryFrequency,
        'Delivery frequency',
        2,
        60,
      ),
      notes: optionalText(req.body.notes, 800),
      accountUserId: (await getSessionUser(req))?.id,
    };

    const record = await saveRecord('order-request', payload, req);
    void notifyLead(record);

    res.status(201).json({
      ok: true,
      id: record.id,
      message: 'Subscription request received. We will confirm the roast schedule shortly.',
    });
  }),
);

app.use('/api', (_req, res) => {
  res.status(404).json({
    ok: false,
    message: 'API route not found.',
  });
});

await mountFrontend();

app.use(
  (error: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error(error);
    }

    res.status(statusCode).json({
      ok: false,
      message:
        statusCode >= 500
          ? 'Something went wrong. Please try again.'
          : error.message,
      details: statusCode >= 500 ? undefined : error.details,
    });
  },
);

app.listen(config.port, config.host, () => {
  console.log(
    `Lumina Coffee Roasters listening on ${config.appUrl} in ${
      config.isProduction ? 'production' : 'development'
    } mode`,
  );
});

function loadConfig(): AppConfig {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';
  const host = process.env.HOST || (isProduction ? '0.0.0.0' : 'localhost');
  const appUrl =
    process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  const appSecret = process.env.APP_SECRET || '';

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('PORT must be a valid positive number.');
  }

  if (isProduction && appSecret.length < 32) {
    throw new Error('APP_SECRET must be at least 32 characters in production.');
  }

  const corsAllowedOrigins = [
    appUrl,
    ...(process.env.CORS_ALLOWED_ORIGIN || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]
    .map(toOrigin)
    .filter(Boolean);

  return {
    appSecret: appSecret || 'development-only-lumina-secret',
    appUrl,
    corsAllowedOrigins: [...new Set(corsAllowedOrigins)],
    dataDir: path.resolve(process.env.DATA_DIR || 'data'),
    host,
    isProduction,
    port,
    stripePriceId: process.env.STRIPE_PRICE_ID || undefined,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || undefined,
    webhookUrl: process.env.LEAD_NOTIFICATION_WEBHOOK_URL || undefined,
  };
}

function securityHeaders(settings: AppConfig) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    if (settings.isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: https://images.unsplash.com https://upload.wikimedia.org https://www.transparenttextures.com",
          "connect-src 'self'",
        ].join('; '),
      );
    }

    next();
  };
}

function cors(settings: AppConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && settings.corsAllowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  };
}

async function mountFrontend() {
  if (!config.isProduction) {
    const {createServer} = await import('vite');
    const vite = await createServer({
      appType: 'spa',
      server: {middlewareMode: true},
    });

    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        const template = await fs.readFile(indexPath, 'utf8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({'Content-Type': 'text/html'}).end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
    return;
  }

  const clientDir = path.resolve(__dirname, '../client');
  app.use(
    express.static(clientDir, {
      index: false,
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store');
        }
      },
    }),
  );

  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

async function saveRecord(
  type: string,
  data: Record<string, unknown>,
  req: Request,
): Promise<LeadRecord> {
  const record: LeadRecord = {
    id: crypto.randomUUID(),
    type,
    createdAt: new Date().toISOString(),
    source: {
      ipHash: hashIp(req.ip || req.socket.remoteAddress || 'unknown'),
      userAgent: req.get('user-agent')?.slice(0, 200),
    },
    data,
  };

  await fs.mkdir(config.dataDir, {recursive: true});
  await fs.appendFile(
    path.join(config.dataDir, `${type}.jsonl`),
    `${JSON.stringify(record)}\n`,
    'utf8',
  );

  return record;
}

async function notifyLead(record: LeadRecord) {
  if (!config.webhookUrl) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(record),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`Lead webhook failed with status ${response.status}.`);
    }
  } catch (error) {
    console.warn('Lead webhook failed.', error);
  } finally {
    clearTimeout(timeout);
  }
}

async function getSessionUser(req: Request): Promise<PublicUser | null> {
  const user = await getStoredSessionUser(req);
  return user ? toPublicUser(user) : null;
}

async function getStoredSessionUser(req: Request): Promise<StoredUser | null> {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === payload.sub);

  return user || null;
}

async function requireUser(req: Request): Promise<StoredUser> {
  const user = await getStoredSessionUser(req);

  if (!user) {
    throw unauthorized('Login is required for this action.');
  }

  return user;
}

async function requireAdmin(req: Request): Promise<StoredUser> {
  const user = await requireUser(req);

  if (user.role !== 'admin') {
    throw forbidden('Admin access is required.');
  }

  return user;
}

async function readUsers(): Promise<StoredUser[]> {
  const filePath = usersFilePath();

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as
      | Array<StoredUser & {role?: UserRole}>
      | {value?: Array<StoredUser & {role?: UserRole}>};
    const rawUsers = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.value)
        ? parsed.value
        : [];
    const users = rawUsers.map((user) => ({
      ...user,
      role: user.role || 'customer',
    }));

    if (users.length > 0 && !users.some((user) => user.role === 'admin')) {
      users[0].role = 'admin';
    }

    return users;
  } catch (error) {
    if (isFileMissing(error)) {
      return [];
    }

    throw error;
  }
}

async function readSubscriptions(): Promise<StoredSubscription[]> {
  return readJsonFile<StoredSubscription[]>('subscriptions.json', []);
}

async function writeSubscriptions(subscriptions: StoredSubscription[]) {
  await writeJsonFile('subscriptions.json', subscriptions);
}

async function readBillingSessions(): Promise<BillingSession[]> {
  return readJsonFile<BillingSession[]>('billing-sessions.json', []);
}

async function writeBillingSessions(sessions: BillingSession[]) {
  await writeJsonFile('billing-sessions.json', sessions);
}

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(config.dataDir, fileName), 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    if (isFileMissing(error)) {
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile(fileName: string, value: unknown) {
  await fs.mkdir(config.dataDir, {recursive: true});
  await fs.writeFile(
    path.join(config.dataDir, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  );
}

async function findPlan(planName: string) {
  const content = (await readSiteContent()) as SiteContentForServer;
  const plans = content.plans?.items || [];
  const plan = plans.find((candidate) => candidate.name === planName);

  if (!plan) {
    throw badRequest('Unknown subscription plan.');
  }

  return plan;
}

async function readSiteContent() {
  const contentPath = path.resolve(process.cwd(), 'content/site-content.json');
  return JSON.parse(await fs.readFile(contentPath, 'utf8')) as unknown;
}

async function createBillingSession(user: StoredUser, plan: string): Promise<BillingSession> {
  if (isStripeConfigured()) {
    const stripeSession = await createStripeCheckoutSession(user);
    const session: BillingSession = {
      id: stripeSession.id,
      userId: user.id,
      plan,
      createdAt: new Date().toISOString(),
      mode: 'stripe',
      url: stripeSession.url,
    };
    const sessions = await readBillingSessions();
    sessions.push(session);
    await writeBillingSessions(sessions);
    return session;
  }

  const session: BillingSession = {
    id: crypto.randomUUID(),
    userId: user.id,
    plan,
    createdAt: new Date().toISOString(),
    mode: 'demo',
    url: `${config.appUrl}/#dashboard`,
  };
  const sessions = await readBillingSessions();
  sessions.push(session);
  await writeBillingSessions(sessions);

  return session;
}

async function createStripeCheckoutSession(user: StoredUser): Promise<{id: string; url: string}> {
  const params = new URLSearchParams({
    mode: 'subscription',
    success_url: `${config.appUrl}/#dashboard?checkout=success`,
    cancel_url: `${config.appUrl}/#plans?checkout=canceled`,
    customer_email: user.email,
    'line_items[0][price]': config.stripePriceId || '',
    'line_items[0][quantity]': '1',
    client_reference_id: user.id,
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const data = (await response.json()) as {id?: string; url?: string; error?: {message?: string}};

  if (!response.ok || !data.id || !data.url) {
    throw badRequest(data.error?.message || 'Stripe checkout session could not be created.');
  }

  return {
    id: data.id,
    url: data.url,
  };
}

async function countJsonlRecords(type: string) {
  try {
    const raw = await fs.readFile(path.join(config.dataDir, `${type}.jsonl`), 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean).length;
  } catch (error) {
    if (isFileMissing(error)) {
      return 0;
    }

    throw error;
  }
}

async function writeUsers(users: StoredUser[]) {
  await fs.mkdir(config.dataDir, {recursive: true});
  await fs.writeFile(usersFilePath(), `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

async function hashPassword(password: string, salt: string) {
  const derivedKey = await scrypt(password, salt);
  return derivedKey.toString('base64url');
}

async function verifyPassword(password: string, user: StoredUser) {
  const candidate = await hashPassword(password, user.passwordSalt);
  const stored = Buffer.from(user.passwordHash, 'base64url');
  const supplied = Buffer.from(candidate, 'base64url');

  return stored.length === supplied.length && crypto.timingSafeEqual(stored, supplied);
}

function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

function setSessionCookie(res: Response, user: PublicUser) {
  const token = signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });

  res.setHeader(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      maxAge: SESSION_TTL_SECONDS,
      sameSite: 'Lax',
      secure: shouldUseSecureCookies(),
    }),
  );
}

function clearSessionCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, '', {
      httpOnly: true,
      maxAge: 0,
      sameSite: 'Lax',
      secure: shouldUseSecureCookies(),
    }),
  );
}

function signSessionToken(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.appSecret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.appSecret)
    .update(encodedPayload)
    .digest('base64url');

  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as SessionPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const cookie of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = cookie.trim().split('=');
    if (!rawName) {
      continue;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join('='));
  }

  return cookies;
}

type CookieOptions = {
  httpOnly: boolean;
  maxAge: number;
  sameSite: 'Lax' | 'Strict' | 'None';
  secure: boolean;
};

function serializeCookie(name: string, value: string, options: CookieOptions) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    role: user.role || 'customer',
  };
}

function usersFilePath() {
  return path.join(config.dataDir, 'users.json');
}

function isFileMissing(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as {code?: string}).code === 'ENOENT'
  );
}

function requiredText(
  value: unknown,
  label: string,
  minLength: number,
  maxLength: number,
) {
  const text = optionalText(value, maxLength);

  if (!text || text.length < minLength) {
    throw badRequest(`${label} must be at least ${minLength} characters.`);
  }

  return text;
}

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw badRequest('Invalid text field.');
  }

  const text = value.trim();
  if (text.length > maxLength) {
    throw badRequest(`Text fields must be ${maxLength} characters or fewer.`);
  }

  return text;
}

function requiredEmail(value: unknown) {
  const email = requiredText(value, 'Email', 5, 254).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw badRequest('Enter a valid email address.');
  }

  return email;
}

function requiredPassword(value: unknown) {
  const password = requiredText(value, 'Password', 8, 200);

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw badRequest('Password must include at least one letter and one number.');
  }

  return password;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isStripeConfigured() {
  return Boolean(config.stripeSecretKey && config.stripePriceId);
}

function shouldUseSecureCookies() {
  return config.isProduction && config.appUrl.startsWith('https://');
}

function badRequest(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = 400;
  return error;
}

function unauthorized(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = 401;
  return error;
}

function forbidden(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = 403;
  return error;
}

function notFound(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = 404;
  return error;
}

function conflict(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = 409;
  return error;
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function hashIp(ip: string) {
  return crypto.createHmac('sha256', config.appSecret).update(ip).digest('hex');
}

function toOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}
