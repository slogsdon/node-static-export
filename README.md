# `static-export`

Pre-renders a web app to static HTML. Perfect for:

- Progressive Web Applications (PWAs)
- Regular ol' Single-Page Applications (SPAs)
- TODO: The website that _just needs to be written in the next-best-thing_ but doesn't run on your server

## Installation

```
npm install -g static-export
```

## Usage

Ensure your web app is present in `./build` of your project directory, and run `static-export`. New HTML files with pre-rendered content are placed alongside existing static assets in `./build`.

See `static-export --help` for more.

## Compatibility

`static-export` uses Chromium (controlled by [`puppeteer`](https://github.com/GoogleChrome/puppeteer)) to load your web app and [`pushstate-server`](https://github.com/scottcorgan/pushstate-server) to serve it, so any client-side JavaScript required to load the initial content should continue to work as long as it runs in a normal browser session.

## LICENSE

This project is licensed under the MIT License.
