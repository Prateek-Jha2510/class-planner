# Class Planner

Offline React + Vite Android app wrapped with Capacitor. All records stay in localStorage on your phone. No account or backend. The first developer build needs internet to download its tools. The installed app works offline.

## Project structure
```
.github/workflows/build-apk.yml
.gitattributes
.gitignore
capacitor.config.json
index.html
package.json
README.md
examples/timetable.json
native/MainActivity.java
native/PlannerDocuments.java
native/planner_icon.xml
scripts/prepare-android.js
src/main.jsx
src/ui.jsx
src/style.css
src/model.js
src/preset.js
src/Today.jsx
src/Homework.jsx
src/Attendance.jsx
src/Timetable.jsx
src/Settings.jsx
src/backup.js
tests/model.test.js
```

## 1. Install on your phone

Open the maintainer's public GitHub repo → Releases → latest release → Assets. Tap **Class-Planner-debug.apk**. No GitHub account is needed. Wait for the full download, open the file, then tap Install. If prompted, choose Settings → Allow from this source for Chrome or Files, go back and tap Install. You can also search Android Settings for “Install unknown apps”. On Android 7 the switch is under Security → Unknown sources. Turn the permission off afterwards.

## 2. Use the app

- **Today** shows the selected day's classes in order. Tap a status to mark it, another to change it, or the same status to clear it. Pick date opens a previous day. Marking a holiday excludes its classes and undo restores the previous marks. Tap the reminder to open the earliest missed date. The homework counter opens pending assignments.
- **Attendance** shows overall and subject counts. Three Attended and one Absent gives 75%, regardless of how many classes were Bunked, Cancelled or Holiday. Zero counted classes show --. Green starts at your chosen target (75% initially), yellow at 60%, and lower values are red.
- **Homework** lets you choose a timetable subject, title, due date, optional time and description. Pending tasks sort by deadline. Overdue tasks are red, today's and tomorrow's are orange. An untimed task is due at the end of its local day. Check the box to complete a task. Expand Completed to reopen, delete or clear it.
- **Timetable** lets you add, edit and delete classes Monday through Sunday. Changes apply from the selected effective date until the next saved version. A date with marks or a holiday keeps its original class list. Clear all marks and undo its holiday to release that snapshot.
- **Settings** (sliders in the header) controls the theme, attendance target and reminder start. Reminders start on first use by default. Export backup opens Android's Save As picker. Choose Downloads and transfer the JSON to your next phone. Import backup validates it and asks before replacing records. Reset all data requires confirmation and starts with an empty timetable.

## 3. Load a timetable

Your DTU B19 semester I shared classes are preloaded from 3 August 2026. Under Timetable select the effective date, then **DTU B19 preset**. Choose G1, G2, G3 or G4 for the EN103 practical. Tutorials labelled G1/G2 have their own switch. ECC1 and Zero Hour are optional. Each consecutive teaching block counts once. Split it into two entries if attendance is taken hourly.

For a custom week, choose **Timetable → Import timetable**, paste the full array, then confirm. It replaces that week's schedule from the selected effective date. This sample is available inside the app and in examples/timetable.json.

```json
[
  {"day":"Mon","subject":"Mathematics I","start":"10:00","end":"11:00","room":"SPS10","teacher":"Dr. Mamta Rani","code":"AM101","kind":"Lecture"},
  {"day":"Tue","subject":"Chemistry","start":"10:00","end":"12:00","room":"SPS12","teacher":"Dr. Priyanka","code":"AC101","kind":"Lecture"}
]
```

Use Mon, Tue, Wed, Thu, Fri, Sat or Sun. Subject, day, start and end are required. Times use 24-hour HH:MM. Keep subject spelling consistent to group lectures and practicals together.

## 4. Set up the project on Windows

Install Node LTS (22.12 or newer), Git and Android Studio Otter 2025.2.1 or newer. In PowerShell:

```powershell
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Git.Git -e
winget install --id Google.AndroidStudio -e
```

Reopen PowerShell. Extract the ZIP, open the folder containing package.json in Explorer, type powershell in its address bar and press Enter. Extracting creates the complete Vite project. To recreate it by hand, run mkdir Class-Planner and cd Class-Planner, then copy the files shown above into it.

```powershell
node --version
npm.cmd install
npm.cmd test
npm.cmd run dev
```

The install reads package.json and installs React, Vite, Capacitor Core, Android and CLI. Open the local address Vite prints. Use Ctrl+C to stop. Browser data and Android data are separate. Commit the generated package-lock.json. On macOS/Linux use npm and npx without .cmd.

## 5. Build locally

1. Open Android Studio → SDK Manager. Install Android SDK Platform 36, Android SDK Platform-Tools, Command-line Tools (latest), and Build-Tools 35.0.0 and 36.0.0. Accept licences. Use JDK 21 in Settings → Build Tools → Gradle.
2. Run these commands once in the project folder:
```powershell
npm.cmd run android:init
npm.cmd run android:open
```
The init command performs these four steps. Use this sequence if you prefer doing them manually:
```powershell
npm.cmd run build
npx.cmd cap add android
node scripts/prepare-android.js
npx.cmd cap sync android
```
Capacitor generates the android folder and Gradle wrapper. The preparation script installs the native backup picker and icon. After source edits run npm.cmd run android:sync.
3. Wait for Gradle sync, select the debug build variant, then **Build → Generate App Bundles or APKs → Generate APKs** (older menu: Build → Build Bundle(s) / APK(s) → Build APK(s)). Click Locate. The installable file is android/app/build/outputs/apk/debug/app-debug.apk.

## 6. Publish the source

Create an empty **public** GitHub repository named class-planner without a README or licence. In your project folder, replace YOUR_USERNAME with your GitHub name:
```powershell
git init -b main
git add .
git commit -m "Build offline Class Planner"
git remote add origin https://github.com/YOUR_USERNAME/class-planner.git
git push -u origin main
```
Complete browser sign-in if prompted. If Git requests an identity, run git config user.name "Your Name" and git config user.email "your-email@example.com", then repeat the commit and push.

## 7. Build automatically and share your first release

Every push runs the workflow in .github/workflows/build-apk.yml. Look under Actions → Build Android APK for its test and build results. Branch builds upload an artifact ZIP containing the APK. Version tags additionally publish the APK directly to Releases.

For updates that install over the old copy, configure a persistent signer **before your first release**. After your first local debug build, copy the Android debug key into your clipboard as Base64:
```powershell
$keyPath = Join-Path $env:USERPROFILE ".android/debug.keystore"
[Convert]::ToBase64String([IO.File]::ReadAllBytes($keyPath)) | Set-Clipboard
```
Open repository Settings → Secrets and variables → Actions → New repository secret. Name it CLASS_PLANNER_DEBUG_KEY_B64 and paste the value. Keep the key private. Clear your clipboard afterwards. This signing step is optional for the first install. Without it, fresh GitHub runners use temporary debug keys and updates can require a reinstall. If building entirely on GitHub you can skip Android Studio and push the tag directly.

```powershell
git tag -a v1.0.0 -m "Class Planner 1.0.0"
git push origin v1.0.0
```
Wait for both build and release jobs to turn green. Send classmates https://github.com/YOUR_USERNAME/class-planner/releases/latest . For updates, commit and push changes, then push a higher tag such as v1.0.1 using the same signer. The workflow derives the Android version from the tag.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| PowerShell blocks npm.ps1 | Use npm.cmd and npx.cmd. |
| Node version error | Install Node 22.12+ or 24 LTS and reopen the terminal. |
| Missing dist or index.html | Run npm.cmd run build from the folder with package.json. |
| Android already added or UI is stale | Run npm.cmd run android:sync, then rebuild the APK. |
| SDK location or licence error | Open android in Android Studio, configure SDK Manager, install API 36 and accept licences. |
| Gradle JVM incompatible | Set Gradle JDK to 21 and use the generated Gradle wrapper. |
| Dependency download failed | The build computer needs access to npm, Gradle and Google Maven. Restore connectivity and retry. |
| Release job gets 403 | Enable Actions and allow the release job contents: write in repo or organisation policy. |
| Phone reports a parsing error | Download the complete APK asset. Extract an Actions artifact ZIP first. Do not rename a ZIP or AAB to APK. Use Android 7+ with an up-to-date WebView. |
| Update says app not installed | Check free space, version and signer. Export a JSON backup before uninstalling a differently signed build. |
| Past classes missing | Check the effective date, group, saved snapshot and reminder start date. |

References: [Capacitor setup](https://capacitorjs.com/docs/updating/8-0), [Android build menu](https://developer.android.com/build/build-for-release), [Android installation help](https://support.google.com/android/answer/9457058).
