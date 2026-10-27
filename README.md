# FairShift

Fair work. Clear wages. Safer workplaces.

## Current status (Phase 2 of 8)

| Area | Status |
|---|---|
| Website (your original `index.html`) | Served unchanged by Express |
| `/healthz` health endpoint | Implemented |
| Listens on `process.env.PORT` | Implemented |
| Firebase Authentication | **Not connected yet.** The sign-in screen is still a demo. |
| Firestore database | **Not connected yet.** Data is stored in the browser only. |
| Attendance, payroll, grievances, skills, analytics (real) | Not started |
| Docker / Cloud Run / GitHub | Not started |
| Deployed | **No.** There is no live URL. |

Everything you see in the website is still demo data until the later phases are done.

## Requirements

- Windows with PowerShell
- Node.js 20 or newer (download the LTS version from https://nodejs.org)

Check your version:

```powershell
node -v
npm -v
```

## Check the folder structure

Your folder must look exactly like this (`index.html` inside `public`, the test file inside `test`):

```
fairshift/
  public/
    index.html
  test/
    server.test.js
  server.js
  package.json
  README.md
  .gitignore
  .env.example
```

Check it in PowerShell from inside the `fairshift` folder:

```powershell
Test-Path .\public\index.html
Test-Path .\test\server.test.js
Test-Path .\server.js
Test-Path .\package.json
```

All four lines must print `True`. Some ZIP tools flatten folders when extracting. If `index.html` or `server.test.js` ended up next to `server.js`, move them:

```powershell
New-Item -ItemType Directory -Force public, test | Out-Null
Move-Item .\index.html .\public\index.html
Move-Item .\server.test.js .\test\server.test.js
```

Before replacing any local project, keep a backup copy of it:

```powershell
Copy-Item "C:\path\to\your-old-project" "C:\path\to\your-old-project-backup" -Recurse
```

## Install

Open PowerShell and go to the project folder (change the path to where you saved it):

```powershell
cd "C:\path\to\fairshift"
npm install
```

This creates `node_modules` and `package-lock.json`. Keep `package-lock.json` (it is committed to Git). `node_modules` is ignored by Git.

If PowerShell says "running scripts is disabled", use `npm.cmd` instead of `npm`, for example `npm.cmd install`.

## Run

```powershell
npm start
```

You should see `FairShift listening on port 8080`. Open http://localhost:8080 in your browser.

To use a different port:

```powershell
$env:PORT = 3000
npm start
```

Stop the server with `Ctrl + C`.

## Check the server is healthy

With the server running, open a second PowerShell window:

```powershell
Invoke-RestMethod http://localhost:8080/healthz
Invoke-RestMethod http://localhost:8080/api/status
```

Expected: `status : ok` for the first, and `firebaseConfigured : False` for the second.

## Test

```powershell
npm test
```

This runs `test/server.test.js` using Node's built-in test runner (no extra packages). At this phase they cover: the health endpoint, the honest status endpoint, 404 for unknown API routes, serving the website, security headers, and blocking files outside `public`.

## Project layout

```
fairshift/
  public/index.html     Your original website (unchanged)
  server.js             Express server
  test/server.test.js   Automated tests
  package.json
  .gitignore            Excludes node_modules, .env files and credentials
  .env.example          Placeholders only
```

## Security rules for this repository

- Never commit `.env` files, service-account JSON files or private keys. `.gitignore` blocks the common names, but always check `git status` before committing.
- Keep the repository under 10 MB. Right now it is well under 1 MB.

## Next phases

Firebase Authentication and Firestore (Phase 3), real attendance and payroll (Phase 4), and so on. Docker, Cloud Run and GitHub publishing instructions are added in Phase 8.
