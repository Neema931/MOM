# Mom's Birthday

A small React + Vite greeting with a welcome screen and a celebratory message.
Open the gift on the welcome screen to reveal the celebration and confetti.

## Development

```sh
npm install
npm run dev
```

## Build and lint

```sh
npm run build
npm run lint
```

The app uses React state to switch between its two stages and
[`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti) for the
celebration effect. No router is needed.
