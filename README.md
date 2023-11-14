# Free Chess Analysis

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fkakfklkhmjkkehkjchemdgeoldekdml?style=for-the-badge)](https://chrome.google.com/webstore/detail/free-chess-analysis/fkakfklkhmjkkehkjchemdgeoldekdml)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/fkakfklkhmjkkehkjchemdgeoldekdml?style=for-the-badge)](https://chrome.google.com/webstore/detail/free-chess-analysis/fkakfklkhmjkkehkjchemdgeoldekdml)

This chrome extension will help you analyze your chess.com games on lichess. Just click the icon in your extension bar when you're on a chess.com game and a new lichess tab will open with your game.

<img src='https://raw.githubusercontent.com/imlokesh/free-chess-analysis/main/src/banners/2.png' alt='Free Chess Analysis' >

## How It Works

-   User clicks the extension icon when on a page like `chess.com/game/live/*`
-   The extension gets the pgn from chess.com share option.
-   The extension creates a new tab with url `lichess.org/paste` and imports your game.
-   The extension will automatically turn on local analysis and flip the board if you were black.

## Suggestions

I welcome suggestions and bug reports. Please open an issue if you would like to suggest something.
