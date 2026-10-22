# Deploying Arlamiluxe

This project deploys the Vite frontend to Netlify and the Express API to Render.
The app also needs a PostgreSQL database; use the connection URL for the database
that contains the Arlamiluxe schema and data.

## 1. Deploy the API to Render

1. Push the project to GitHub and create a Render **Blueprint** from the repository.
   Render detects `render.yaml` and creates the `arlamiluxe-api` web service.
2. Set these service environment variables in Render:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `FRONTEND_URL`: the frontend origin, such as `https://arlamiluxe.netlify.app`.
     Do not include a trailing slash. Multiple origins can be comma-separated.
   - `PAYSTACK_SECRET_KEY`: your Paystack secret key (optional if payments are not enabled).
   - `PAYSTACK_CALLBACK_URL`: the full frontend payment-return URL, such as
     `https://arlamiluxe.netlify.app/payment-success`.
   - `SUPABASE_URL`: the value of `VITE_SUPABASE_URL` from your local `.env`.
   - `SUPABASE_SECRET_KEY`: the value of `SUPABASE_SECRET_KEY` from your local `.env`.
   - `SUPABASE_STORAGE_BUCKET`: the value of `SUPABASE_STORAGE_BUCKET` from your local `.env`.
3. Render generates `SESSION_SECRET` from the Blueprint. Keep it secret.
4. After the service is live, verify `https://<your-render-service>.onrender.com/health`
   returns `{"status":"ok"}` and copy the service origin for Netlify.

Create a **public** bucket in the Supabase project identified by `SUPABASE_URL`,
with the exact name set in `SUPABASE_STORAGE_BUCKET`. The API uses the secret key
to upload images to that bucket; the frontend displays the resulting public URLs.
Keep the secret key only in Render and your local untracked `.env`; never add it
to Netlify or a `VITE_*` variable. The publishable key is not needed for this
server-side upload flow.

The Blueprint uses Render's free web-service plan, which can sleep. Image files
are stored in Supabase Storage, not the Render filesystem. The session store is
in memory, so a server restart logs users out.

## 2. Deploy the frontend to Netlify

1. Import the same GitHub repository in Netlify. `netlify.toml` configures the
   repository root as the base directory and builds the frontend there (needed
   because it imports `shared/schema.ts` from outside `client`), with an SPA fallback.
2. Add this environment variable in **Site configuration → Environment variables**:
   - `VITE_API_URL`: the Render service origin, e.g.
     `https://arlamiluxe-api.onrender.com` (no trailing slash).
3. Trigger a new deploy after saving the variable.
4. Copy the published Netlify site origin and set it as Render's `FRONTEND_URL`.
   Redeploy/restart the Render service after changing the variable.

`VITE_API_URL` is public frontend configuration, not a secret. Never put the
database URL or Paystack secret in a `VITE_*` variable.

## 3. Database and first run

The API expects the existing PostgreSQL schema. If deploying to a new database,
set `DATABASE_URL` on Render and run `npm run db:push` from a trusted local
environment configured with that database URL. To add the initial admin user,
set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters in
your trusted local environment, then run `npm run seed-admin`. The script has no
default admin password. Public registration always creates customer accounts;
never try to assign an admin role through the registration form or API.
Do not commit production credentials or expose them in Netlify.

## Cookies and custom domains

The API enables credentialed CORS for the exact origins in `FRONTEND_URL` and
uses secure cross-site session cookies in production. For best browser
compatibility, use custom domains on the same site (for example,
`www.arlamiluxe.com` for Netlify and `api.arlamiluxe.com` for Render) rather
than relying on third-party cookies between the default `netlify.app` and
`onrender.com` domains. Update `FRONTEND_URL`, `VITE_API_URL`, and
`PAYSTACK_CALLBACK_URL` to match those domains.
