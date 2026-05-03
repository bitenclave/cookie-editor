# Cookie-Editor

Cookie-Editor is a browser extension/add-on for creating, editing, deleting,
importing and exporting cookies for the current tab.

This repository is maintained by the BitEnclave Team at
https://github.com/bitenclave/cookie-editor.

## Download

This fork is distributed only through GitHub Releases:

https://github.com/bitenclave/cookie-editor/releases

Download the latest release package from that page and install it manually in
your browser as an unpacked or sideloaded extension.

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

This fork is intended for manual installation from the release builds. Browser
store links for the original extension are intentionally not included here.

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
