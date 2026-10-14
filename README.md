# CloudNotes — Cloud-Based Online Notes Manager

> **A modern, privacy-first personal knowledge base built with React, Vite, and Google Identity Services that uses Google Drive as its native cloud storage backend.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.x-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF)](https://vitejs.dev/)
[![Storage](https://img.shields.io/badge/Storage-Google%20Drive%20v3-00AC47)](https://developers.google.com/drive)
[![OAuth](https://img.shields.io/badge/OAuth-Google%20Identity%20Services-EA4335)](https://developers.google.com/identity)

---

## 1. Project Overview

**CloudNotes** is an engineering mini-project in Cloud Computing that enables users to securely create, edit, search, categorize, favorite, and manage Markdown notes stored directly inside their personal **Google Drive**.

Unlike traditional note-taking apps that store user data on proprietary databases (e.g., Firebase, Supabase, MongoDB), CloudNotes adopts a **decentralized, serverless client architecture**:
- **Zero Third-Party Database Lock-in:** Notes are stored directly in the user's private Google Drive in a dedicated `CloudNotes/` folder.
- **Portability:** Every note is an open standard UTF-8 Markdown (`.md`) file with structured YAML frontmatter.
- **Least-Privilege Security:** CloudNotes requests only the `https://www.googleapis.com/auth/drive.file` scope. It cannot view, modify, or delete any of your other Drive files.
- **Light Glassmorphic Aesthetic:** Clean, masculine, modern desktop interface with translucent white surfaces, subtle borders, soft atmospheric glow, and cobalt blue accents.
- **Interactive Demo Sandbox:** Full evaluation mode with realistic sample notes across multiple categories, completely isolated from real Google Drive.

---

## 2. Key Features

- **Google OAuth 2.0 Authentication:** Implemented via Google's latest Google Identity Services (GIS) Web Token Client.
- **Google Drive v3 REST API Integration:**
  - Auto-discovery and creation of the `CloudNotes` folder.
  - Multipart uploads combining Drive file metadata and Markdown content.
  - Non-destructive deletion using Google Drive's native Trash (`trashed: true`) and Trash restoration.
  - Direct folder links opening the actual folder in Google Drive.
- **Polished Markdown Note Editor:**
  - Live split preview rendering and Write-only / Preview-only modes.
  - Rich formatting toolbar: Bold, Italic, Headings (H1/H2/H3), Bullet & Numbered lists, Checklists (`[x]`), Code blocks, Quotes, and Horizontal rules.
  - Live document telemetry: Real-time word count, character count, and estimated reading time.
  - Unsaved-changes protection dialog and `Ctrl + S` / `Cmd + S` keyboard shortcuts.
  - Direct `.md` file export/download.
- **Organization & Search:**
  - Real-time search across note titles, contents, and tags with `Ctrl + K` quick focus.
  - Multi-category classification (Study, Work, Personal, Ideas, Projects, Travel, Custom).
  - Pinned Favorites view.
  - Grid View and List View toggling.
  - Sorting by Recently Modified, Date Created, and Title (A-Z).
- **Responsive & Accessible Design:**
  - Desktop-first layout optimized for 1440 × 900 resolution with full tablet and mobile responsiveness.
  - Animated stat counters for Total Notes, Favorites, Categories, and Drive Status.
  - Respects `prefers-reduced-motion`.

---

## 3. System Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                CloudNotes React + Vite Application                |  |
|  |  +------------------+  +--------------------+  +---------------+  |  |
|  |  |  Sidebar & Nav   |  |  Dashboard / Grid  |  |  Note Editor  |  |  |
|  |  +--------+---------+  +---------+----------+  +-------+-------+  |  |
|  |           |                      |                     |          |  |
|  |  +--------v----------------------v---------------------v-------+  |  |
|  |  |                  Application State Hooks                    |  |  |
|  |  |           useAuth (Token State) & useNotes (CRUD)           |  |  |
|  |  +--------+--------------------------------------------+-------+  |  |
|  |           |                                            |          |  |
|  |  +--------v--------------+            +----------------v-------+  |  |
|  |  |   googleAuth Service  |            |   googleDrive Service  |  |  |
|  |  |  (GIS Token Client)   |            |   (Drive v3 REST API)  |  |  |
|  |  +--------+--------------+            +----------------+-------+  |  |
|  +-----------|--------------------------------------------|----------+  |
+--------------|--------------------------------------------|-------------+
               | (1) OAuth 2.0 Auth Request                 | (3) Multipart REST Calls
               v                                            v
+-------------------------------+             +---------------------------+
|    Google Identity Services   |             |    Google Drive API v3    |
|   (accounts.google.com/gsi)   |             |  (www.googleapis.com)    |
+--------------+----------------+             +-------------+-------------+
               | (2) Access Token (Bearer)                  | (4) Files:
               +------------------------------------------->|     `CloudNotes/*.md`
```

### Note File Format (.md with Frontmatter)
```markdown
---
title: "Cloud Computing Architecture & Models"
category: "Study"
favorite: true
createdAt: "2026-10-14T06:00:00.000Z"
updatedAt: "2026-10-14T06:15:00.000Z"
noteId: "note_k8s9x2_a9f1"
tags: ["cloud", "architecture", "viva-prep"]
---

# Cloud Computing Architecture & Models
## Key Service Models
- **IaaS**: Raw compute, network, and storage.
- **PaaS**: Runtime environments for code.
- **SaaS**: Turnkey cloud applications.
```

---

## 4. Google Cloud Setup Guide (Step-by-Step)

To connect CloudNotes to your personal Google Drive, follow these steps to generate a free **Google OAuth 2.0 Client ID**:

### Step 1: Create a Google Cloud Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name your project (e.g., `CloudNotes-Project`) and click **Create**.

### Step 2: Enable the Google Drive API
1. In the navigation menu, go to **APIs & Services > Library**.
2. Search for **Google Drive API**.
3. Select **Google Drive API** and click **Enable**.

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select User Type: **External** and click **Create**.
3. Fill in the required application details:
   - **App name:** `CloudNotes`
   - **User support email:** Select your Gmail address.
   - **Developer contact information:** Enter your email.
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes**:
   - Manually add or search for: `https://www.googleapis.com/auth/drive.file`
   - Also ensure `.../auth/userinfo.profile` and `.../auth/userinfo.email` are selected.
   - Click **Update** and then **Save and Continue**.
6. Under **Test Users**:
   - Click **+ Add Users** and enter your personal Gmail address.
   - *Note: While in "Testing" mode, only designated test users can log in.*
7. Click **Save and Continue** and finish the wizard.

### Step 4: Create OAuth 2.0 Web Client ID
1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Set **Application type** to: `Web application`.
4. Set **Name** to: `CloudNotes Web Client`.
5. Under **Authorized JavaScript origins**, click **+ Add URI**:
   - For local development: `http://localhost:5173`
   - If using a preview port: `http://localhost:4173`
   - For production deployment: `https://your-username.github.io` (or your Vercel/Netlify domain)
6. Leave **Authorized redirect URIs** blank (the GIS popup token flow does not require redirect endpoints).
7. Click **Create**.
8. Copy your generated **Client ID** (it looks like `123456789-abcdef.apps.googleusercontent.com`).

### Step 5: Add Client ID to CloudNotes
You can supply your Client ID in **either** of two ways:

#### Option A: Via Environment File
Create a `.env` file in the project root:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

#### Option B: In-App UI Configuration
Launch the app, click **"Configure Google Cloud OAuth Client ID"** on the Login screen or inside **Settings**, paste your Client ID, and click **Save Client ID**. The application will store it locally and authorize instantly without restarting Vite!

---

## 5. Local Development & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (Node v22+ recommended)
- **npm**: v9.0.0 or higher

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/cloudnotes.git
cd cloudnotes

# 2. Install dependencies
npm install

# 3. Copy sample environment file
cp .env.example .env

# 4. Start the Vite development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Building for Production
```bash
npm run build
```
The optimized static production bundle will be generated in the `dist/` folder.

---

## 6. Cloud Computing Mini-Project Academic Report

### Abstract
CloudNotes is a serverless personal knowledge management system designed around decentralized cloud storage principles. By leveraging Google's OAuth 2.0 Identity Services and Google Drive v3 REST API, the application eliminates backend database hosting expenses and guarantees complete user data ownership. Notes are synchronized directly between the client browser and the user's private Google Drive as UTF-8 Markdown documents.

### Problem Statement
Most web-based note applications (e.g., Evernote, Notion, Google Keep) store user notes on centralized proprietary databases. This model introduces recurring server hosting costs, single points of failure, vendor lock-in, and privacy vulnerabilities. Users cannot easily access, inspect, or back up their raw files outside the proprietary platform.

### Proposed System
CloudNotes addresses these limitations through:
1. **Decentralized Storage**: Google Drive acts as the object storage tier. The application requires zero custom backend databases.
2. **Open Data Formats**: Notes are stored in plain-text Markdown (`.md`) files with standard YAML metadata, readable by any text editor or IDE.
3. **Least-Privilege Security**: Using OAuth 2.0 scope `drive.file`, the application is strictly quarantined to files it creates.

### Hardware & Software Requirements
- **Development & Client Hardware:** Minimum 2 GB RAM, Dual-core CPU, active broadband internet connection.
- **Software:** Modern web browser (Chrome, Edge, Firefox, Safari) with JavaScript enabled.
- **Frontend Stack:** React 19, Vite 8, Framer Motion, Lucide React, Google Identity Services library.
- **Cloud Backend:** Google Cloud Platform (Google Drive API v3, Google OAuth 2.0).

### Advantages & Limitations
| Advantages | Limitations |
| :--- | :--- |
| Zero database operating costs | Requires internet connectivity for real-time Drive sync |
| 100% user data ownership & privacy | Rate-limited by Google API quotas (12,000 queries/min) |
| Standard UTF-8 Markdown format | Concurrent edits across devices require manual refresh |
| Least privilege permissions (`drive.file`) | Requires active Google account |

---

## 7. Viva & Examination Preparation (Frequently Asked Questions)

### Q1: What is Cloud Computing?
**Answer:** Cloud computing is the on-demand delivery of computing resources (servers, storage, databases, networking, software) over the internet with pay-as-you-go pricing, defined by NIST through 5 essential characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service.

### Q2: What is the difference between SaaS, PaaS, and IaaS?
- **IaaS (Infrastructure as a Service):** Provides raw physical or virtual machines, storage, and networks (e.g., AWS EC2, Google Compute Engine).
- **PaaS (Platform as a Service):** Provides a managed runtime environment where developers deploy application code without managing OS or hardware (e.g., Google App Engine, Heroku).
- **SaaS (Software as a Service):** Complete software applications accessible via a web browser (e.g., Google Drive, Slack). CloudNotes is a client application utilizing Google Drive as cloud storage.

### Q3: What is the difference between Authentication (AuthN) and Authorization (AuthZ)?
- **Authentication (AuthN):** Verifying **who the user is** (e.g., logging in with Google credentials to prove user identity).
- **Authorization (AuthZ):** Determining **what permissions the user grants to an application** (e.g., granting CloudNotes permission to create files in Drive via OAuth 2.0 scopes).

### Q4: Why did you use OAuth 2.0 instead of storing the user's password?
**Answer:** Storing passwords in frontend or third-party servers is a severe security risk. OAuth 2.0 allows users to grant specific, scoped access to their resources without ever revealing their Google password. The client receives a short-lived Bearer access token that expires automatically.

### Q5: What is the Principle of Least Privilege, and how is it implemented in CloudNotes?
**Answer:** The Principle of Least Privilege states that a system should be given only the minimum permissions required to perform its function. Instead of requesting full Drive access (`https://www.googleapis.com/auth/drive`), CloudNotes requests `https://www.googleapis.com/auth/drive.file`. This ensures the app can **only** read and write files it created or that the user explicitly opened with it.

### Q6: How does Google Drive API Multipart Upload work?
**Answer:** Multipart upload (`uploadType=multipart`) transmits both the file's JSON metadata (filename, MIME type, folder parent ID, properties) and the file's raw binary or text content in a single HTTP `POST` or `PATCH` request using MIME multipart boundary separation (`multipart/related`).

---

## 8. Manual Testing Verification Matrix

| Test ID | Scenario | Expected Result | Status |
| :---: | :--- | :--- | :---: |
| **TC-01** | Initial app launch | Splash animation plays; Login screen displays branding | PASS |
| **TC-02** | Unauthenticated access | Protected views cannot be accessed before signing in | PASS |
| **TC-03** | Interactive Demo launch | Enters sandbox environment with 6 realistic notes | PASS |
| **TC-04** | Google Sign-In with Client ID | GIS token client launches popup; profile data loads | PASS |
| **TC-05** | Drive folder discovery | Locates or creates `CloudNotes` folder in Drive | PASS |
| **TC-06** | Create new note | Saves UTF-8 `.md` file with frontmatter in Drive | PASS |
| **TC-07** | Edit note content & title | Sends `PATCH` request to update existing Drive file ID | PASS |
| **TC-08** | Trash note | Sets `trashed: true` in Drive; file appears in Trash tab | PASS |
| **TC-09** | Restore note | Sets `trashed: false`; note returns to active notes | PASS |
| **TC-10** | Permanent note deletion | Sends `DELETE` request with user confirmation dialog | PASS |
| **TC-11** | Live search & filter | Instant filtering by query, category, and favorites | PASS |
| **TC-12** | View toggle (Grid / List) | Layout switches seamlessly and persists in localStorage | PASS |
| **TC-13** | Unsaved changes guard | Closing editor prompts confirmation to prevent data loss | PASS |
| **TC-14** | Offline network detection | Disconnecting internet shows "Offline" sync pill | PASS |
| **TC-15** | Token expiration handling | Offers Reconnect / Renew button if token expires | PASS |

---

## 9. Deployment Instructions (GitHub Pages & Vercel)

### Deploying to GitHub Pages
1. In `vite.config.js`, set `base: '/<repository-name>/'`.
2. Run `npm run build`.
3. Push the `dist/` directory to the `gh-pages` branch using `gh-pages` npm package:
   ```bash
   npx gh-pages -d dist
   ```
4. In Google Cloud Console, add your GitHub Pages URL (e.g., `https://your-username.github.io`) to **Authorized JavaScript origins**.

### Deploying to Vercel
1. Install Vercel CLI: `npm i -g vercel`.
2. Run `vercel` and follow prompts.
3. Add your Vercel URL to **Authorized JavaScript origins** in Google Cloud Console.

---

## 10. License & Credits

Developed as a Cloud Computing Mini-Project. Built with React, Vite, Framer Motion, and Lucide React. Storage provided by Google Drive API v3.
