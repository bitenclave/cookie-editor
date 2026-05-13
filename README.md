# Cookie-Editor

Cookie-Editor is a browser extension/add-on for creating, editing, deleting,
importing and exporting cookies for the current tab.

This repository is maintained by the BitEnclave Team at
https://github.com/bitenclave/cookie-editor.

Available in browser stores:

<a href="https://addons.mozilla.org/ru/firefox/addon/cookie-editor-enclave/"><img src="assets/badges/firefox-add-ons.png" alt="Get the add-on for Firefox" height="60"></a>
<a href="https://chromewebstore.google.com/detail/gieaaboadafdijjoamoeeokabfddiplg"><img src="assets/badges/chrome-web-store.png" alt="Available in the Chrome Web Store" height="60"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/odbliigjdahnmnhgjnfmdgengfdlmccc"><img src="assets/badges/microsoft-edge-add-ons.png" alt="Get it from Microsoft Edge" height="60"></a>

## Download

Install Cookie-Editor from your browser's extension store:

- [Firefox Add-ons](https://addons.mozilla.org/ru/firefox/addon/cookie-editor-enclave/)
- [Chrome Web Store](https://chromewebstore.google.com/detail/gieaaboadafdijjoamoeeokabfddiplg)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/odbliigjdahnmnhgjnfmdgengfdlmccc)

Release packages are also available from GitHub Releases:

https://github.com/bitenclave/cookie-editor/releases

Download the latest release package from that page if you need to install it
manually as an unpacked or sideloaded extension.

## Description

Cookie-Editor provides a simple interface for common cookie operations while
developing, testing, debugging, or managing site cookies manually.

You can:

- Create cookies for the current page
- Edit existing cookies
- Delete individual cookies
- Delete all cookies for the current page
- Import and export cookies
- Save reusable cookie profiles locally or against a self-hosted cloud server

## Cloud profile server

Cookie-Editor can store saved cookie profiles in local extension storage or in
a self-hosted server. The companion server lives at:

https://github.com/bitenclave/cookie-server

Use `cookie-editor` for the browser extension and `cookie-server` when you want
profile sync backed by your own PostgreSQL database and bearer-token auth.

## Browser support

This fork supports Firefox, Chrome, Microsoft Edge, Opera, and Safari builds.

## Feature suggestions or bug reports

Please use this repository's Issues tab for feature suggestions and bug reports.

## How to build

1. Run `npm install` to install the required packages.
2. Run `grunt`.
3. The built files are created in the `dist` directory.

## Attribution and license

Cookie-Editor v2 is a heavily reworked BitEnclave fork of
https://github.com/Moustachauve/cookie-editor. We are grateful to the original
project for the foundation this work started from.

BitEnclave's new work is intended to be MIT-licensed where it is separable from
upstream-derived code. This distribution preserves the GPL-3.0-only obligations
inherited from the original project.

### Note for Safari

Safari builds require Xcode.

## Disclaimer

This project is not an official Google project. It is not supported by Google,
and Google specifically disclaims all warranties as to its quality,
merchantability, or fitness for a particular purpose.
