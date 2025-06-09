showToastMessage("Waiting for game PGN...");
chrome.runtime.sendMessage({ type: "log", content: `extension clicked... waiting for pgn` });

async function getPgn() {
    let username = null;
    const focusMode = document.body.classList.contains("theatre-mode");

    if (focusMode) {
        chrome.runtime.sendMessage({ type: "log", content: `focus mode detected` });
        document.querySelector("#board-controls-focus")?.click();
    }

    const players = document.querySelectorAll(
        '[data-test-element="user-tagline-username"], a.user-username-link.user-tagline-compact-username'
    );
    if (players && players[1]) username = players[1].textContent;

    chrome.runtime.sendMessage({ type: "log", content: `username: ${username}` });

    (await waitForElm("button.share"))?.click();
    (await waitForElm("#tab-pgn"))?.click();

    const textarea = await waitForElm("textarea[name=pgn]");
    const pgn = textarea?.value || "";

    (await waitForElm('#share-modal button[aria-label="Close"]'))?.click();

    if (focusMode) {
        document.querySelector("#board-controls-focus")?.click();
    }

    const result = {
        pgn,
        isWhite: username == null || pgn.includes(`[White "${username}"]`)
    };

    chrome.runtime.sendMessage({ type: "log", content: result });

    return result;
}

getPgn();
