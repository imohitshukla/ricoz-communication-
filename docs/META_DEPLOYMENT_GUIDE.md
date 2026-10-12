# 🌐 Production Meta App Deployment Guide (WhatsApp & Instagram)

> **Ricoz Communication Engine v4.0.0**  
> Complete end-to-end technical guide for connecting, configuring, securing, and deploying live **WhatsApp Cloud API** and **Instagram Direct & Comments** via Meta’s Graph API (v20.0).

---

## 📋 Table of Contents
1. [Architecture & Security Overview](#1-architecture--security-overview)
2. [Meta App Creation & Setup](#2-meta-app-creation--setup)
3. [WhatsApp Cloud API Configuration](#3-whatsapp-cloud-api-configuration)
4. [Instagram Messaging Configuration](#4-instagram-messaging-configuration)
5. [Webhook Registration & HMAC SHA-256 Security](#5-webhook-registration--hmac-sha-256-security)
6. [Multi-Tenant Workspace Configuration](#6-multi-tenant-workspace-configuration)
7. [Dynamic Templates & Media Handling](#7-dynamic-templates--media-handling)
8. [Production Go-Live Checklist](#8-production-go-live-checklist)
9. [Troubleshooting & Meta Error Codes](#9-troubleshooting--meta-error-codes)

---

## 1. Architecture & Security Overview

Ricoz interfaces directly with Meta's official Graph API (v20.0) without third-party aggregators:

```
┌─────────────────────────────────┐
│     Customer Mobile Device      │
│     (WhatsApp / Instagram)      │
└───────────────▲─────────────────┘
                │
                │ TLS 1.3
                ▼
┌─────────────────────────────────┐
│      Meta Graph API v20.0       │
│  (Cloud API / Webhook Dispatch) │
└───────────────▲─────────────────┘
                │
     HTTPS Webhook with HMAC SHA-256
                │
                ▼
┌─────────────────────────────────┐
│        Ricoz Backend Engine     │
│   ├── verifyMetaSignature       │
│   ├── Inbound Message Parser    │
│   ├── Inbound Media Downloader  │
│   ├── Multi-tenant WABA Router  │
│   └── Gemini AI / Unified Inbox │
└─────────────────────────────────┘
```

### Key Security Safeguards:
- **HMAC SHA-256 Webhook Verification**: Every payload from Meta includes an `X-Hub-Signature-256` header. The backend validates this hash using `META_APP_SECRET` against the raw byte stream before executing any business logic.
- **Permanent System User Tokens**: Replaces expiring temporary tokens with system user tokens that do not expire.
- **Tenant Isolation**: Each workspace in Ricoz can store its own `phoneNumberId`, `wabaId`, `accessToken`, and `instagramAccountId` in PostgreSQL, fully isolated from other workspaces.

---

## 2. Meta App Creation & Setup

1. Log into [Meta for Developers](https://developers.facebook.com/).
2. Click **My Apps** → **Create App**.
3. Select **Other** as the use case → Next.
4. Select App Type: **Business** → Next.
5. Provide:
   - **App Name**: `Ricoz Communication` (or your company name).
   - **App Contact Email**: Your technical email.
   - **Business Account**: Select your verified Meta Business Account.
6. Click **Create App**.

---

## 3. WhatsApp Cloud API Configuration

### Add WhatsApp to your App:
1. In the App Dashboard left sidebar, find **Add Products to Your App**.
2. Locate **WhatsApp** and click **Set Up**.
3. Under **WhatsApp** → **API Setup**:
   - You will see a temporary access token and a test phone number.
   - Note the **Phone Number ID** and **WhatsApp Business Account ID (WABA ID)**.

### Generate a Permanent System User Token:
> ⚠️ **Crucial**: Never use the 24-hour temporary token in production!

1. Open [Meta Business Suite](https://business.facebook.com/settings/).
2. Navigate to **Business Settings** → **Users** → **System Users**.
3. Click **Add** → Name: `Ricoz System User` → Role: `Admin`.
4. Click **Add Assets**:
   - Assign your WhatsApp Business Account with **Full Control (Manage WhatsApp Account)**.
5. Click **Generate New Token**:
   - Select your App: `Ricoz Communication`.
   - Token Expiration: **Never**.
   - Select Required Permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
6. Click **Generate Token** and immediately copy and securely save this token.

---

## 4. Instagram Messaging Configuration

### Prerequisites:
- Your Instagram account must be a **Professional Account** (Creator or Business).
- The Instagram account must be connected to a **Facebook Page** that your Meta Business Manager owns.
- Enable **Allow Access to Messages** in Instagram App:  
  *Settings → Privacy → Messages → Connected Tools → Toggle "Allow Access to Messages" ON*.

### App Setup:
1. In Meta App Dashboard, click **Add Product** → **Instagram** → **Set Up**.
2. Also add the **Messenger** product (required for Webhook routing).
3. Under **Instagram** → **Basic Display / API**:
   - Add your Facebook Page connected to the Instagram account.
   - Generate a **Page Access Token** with permissions:
     - `instagram_basic`
     - `instagram_manage_messages`
     - `pages_show_list`
     - `pages_read_engagement`
4. Copy your **Instagram Business Account ID** and **Page Access Token**.

---

## 5. Webhook Registration & HMAC SHA-256 Security

### In Ricoz Backend:
Ensure the following environment variable is set in your backend `.env` or Railway environment:
```env
META_APP_SECRET="your_app_secret_from_meta_app_settings_basic"
WHATSAPP_VERIFY_TOKEN="ricoz_webhook_token"
```

### WhatsApp Webhook Registration:
1. In Meta App Dashboard, go to **WhatsApp** → **Configuration**.
2. Under **Webhook**, click **Edit**:
   - **Callback URL**: `https://<your-backend-domain>/api/whatsapp/webhook`
   - **Verify Token**: `ricoz_webhook_token`
   - Click **Verify and Save**.
3. Under **Webhook Fields**, click **Manage**:
   - Subscribe to:
     - ✅ `messages`
     - ✅ `message_template_status_update`

### Instagram Webhook Registration:
1. Go to **Messenger** → **Instagram Settings** (or **Webhooks**).
2. Select **Instagram** from the dropdown:
   - **Callback URL**: `https://<your-backend-domain>/api/instagram/webhook`
   - **Verify Token**: `ricoz_webhook_token`
3. Under Subscriptions:
   - Subscribe to:
     - ✅ `messages`
     - ✅ `messaging_postbacks`
     - ✅ `messaging_seen`

---

## 6. Multi-Tenant Workspace Configuration

Workspaces can configure their credentials via two methods:

### Method A: Via Ricoz Dashboard UI (Workspace-specific)
1. Navigate to **Dashboard** → **Integrations**.
2. Locate **WhatsApp Business API** or **Instagram Direct**.
3. Click **Setup** / **Configure**:
   - Paste the **Permanent Access Token**.
   - Paste the **Phone Number ID** (and optional WABA ID).
4. Click **Verify & Save**. Ricoz will test the credentials live against Meta before saving.

### Method B: Via Global Environment Variables (Default Tenant)
In your backend `.env` or Railway dashboard:
```env
WHATSAPP_ACCESS_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="109283746501928"
WHATSAPP_WABA_ID="98127391823719"

INSTAGRAM_ACCESS_TOKEN="EAAG..."
INSTAGRAM_ACCOUNT_ID="17841400000000000"
META_APP_SECRET="a1b2c3d4..."
```

---

## 7. Dynamic Templates & Media Handling

### WhatsApp Templates:
- Ricoz queries `GET https://graph.facebook.com/v20.0/{WABA_ID}/message_templates` to synchronize approved templates, parameters, languages, and quick reply buttons.
- Outbound broadcasts use approved templates to guarantee 100% deliverability outside the 24-hour customer service window.

### Inbound Media Downloader:
- When customers send images, voice notes, documents, or videos:
  1. Meta sends a webhook containing a `media_id`.
  2. The Ricoz media downloader fetches the binary file from Graph API using the workspace access token.
  3. The file is saved locally to `/uploads/` (or S3/Cloud Storage) and rendered directly inside the **Unified Inbox**.

---

## 8. Production Go-Live Checklist

Complete this checklist prior to public launch:

- [ ] **Meta Business Verification**: Complete document verification under *Meta Business Settings → Security Center*. (Required to scale beyond 250 conversations/24h).
- [ ] **Phone Number Display Name Review**: Submit your company display name for approval under *WhatsApp Manager → Phone Numbers*.
- [ ] **Switch App from Development to Live**:
  - In Meta App Dashboard header, toggle from **In Development** to **Live**.
  - Note: You must provide a valid Privacy Policy URL and Terms of Service URL in *App Settings → Basic*.
- [ ] **Data Use Checkup**: Review and submit Meta's annual Data Use Checkup.
- [ ] **Webhook HTTPS Certificate**: Confirm your backend has a valid SSL certificate (handled automatically by Railway/Render/Cloudflare).
- [ ] **Run Live Diagnostic Handshake**: Go to Ricoz **Dashboard → Integrations** and click **Test All Channels** to confirm green response status.

---

## 9. Troubleshooting & Meta Error Codes

| Error Code | Meaning | Resolution |
| :--- | :--- | :--- |
| `190` | Invalid / Expired Access Token | Generate a permanent System User Token with `whatsapp_business_messaging`. |
| `131030` | Recipient phone number not in allowed list | Switch app mode to **Live** or add recipient to tester numbers. |
| `131047` | 24-hour service window closed | You cannot send freeform text; dispatch an approved WhatsApp Template message instead. |
| `100` | Unsupported parameter / Invalid media URL | Ensure media URL is publicly accessible over HTTPS. |
| `403 Signature mismatch` | HMAC SHA-256 header validation failed | Check that `META_APP_SECRET` in `.env` matches Meta App Settings → Basic → App Secret exactly. |

---

*Authored by the Ricoz Engineering Team. Verified for Meta Graph API v20.0.*
