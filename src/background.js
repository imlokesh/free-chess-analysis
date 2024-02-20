const rule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: ".chess.com", schemes: ["https"] } })
    ],
    actions: [new chrome.declarativeContent.ShowAction()]
};

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([rule]);
    });
});

let lichessTab, pgnResult;

chrome.action.onClicked.addListener(async (tab) => {
    pgnResult = lichessTab = null;

    pgnResult = (
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getPgn
        })
    )[0].result;

    lichessTab = await chrome.tabs.create({ url: "https://lichess.org/paste", index: tab.index + 1 });
    chrome.tabs.onUpdated.addListener(lichessImport);
});

async function lichessImport(id, changeInfo, tab) {
    if (id != lichessTab.id || changeInfo?.status != "complete") {
        return;
    }

    chrome.tabs.onUpdated.removeListener(lichessImport);
    chrome.tabs.onUpdated.addListener(lichessAfterImport);

    await chrome.scripting.executeScript({
        target: { tabId: lichessTab.id },
        func: fillPgn,
        args: [pgnResult]
    });
}

async function lichessAfterImport(id, changeInfo, tab) {
    if (id != lichessTab.id || changeInfo?.status != "complete") {
        return;
    }

    chrome.tabs.onUpdated.removeListener(lichessAfterImport);

    await chrome.scripting.executeScript({
        target: { tabId: lichessTab.id },
        func: setAnalysisOptions,
        args: [pgnResult.isWhite]
    });
}

async function setAnalysisOptions(isWhite) {
    function waitForElm(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver((mutations) => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    await waitForElm("#analyse-toggle-ceval");

    await timeout(1000);

    if (!document.querySelector("#analyse-toggle-ceval").checked) {
        document.querySelector("label[for=analyse-toggle-ceval]").click();
    }

    await timeout(2000);

    if (isWhite || document.querySelector("coords.black")) return;

    document
        .querySelector('[data-act="menu"]')
        .dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

    await timeout(500);

    document.querySelector(".action-menu__tools a").click();

    await timeout(500);

    document
        .querySelector('[data-act="menu"]')
        .dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
}

async function fillPgn(pgnResult) {
    function waitForElm(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver((mutations) => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    (await waitForElm("#form3-pgn")).value = pgnResult.pgn;
    (await waitForElm("#form3-analyse")).click();
    (await waitForElm("form.form3 button[type=submit]")).click();
}

async function getPgn() {
    function waitForElm(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver((mutations) => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    let username = null;
    let focusMode = document.body.classList.contains("theatre-mode");

    // exit focus mode
    if (focusMode) {
        document.querySelector("#board-controls-focus").click();
    }

    let players = document.querySelectorAll(
        '[data-test-element="user-tagline-username"],a.user-username-link.user-tagline-compact-username'
    );

    if (players && players[1]) username = players[1].text;

    (await waitForElm("button.share")).click();
    (await waitForElm(".share-menu-tab-selector-component .share-menu-tab-selector-tab")).click();
    let pgn = (await waitForElm("textarea[name=pgn]")).value;
    (await waitForElm('#share-modal button[aria-label="Close"]')).click();

    // go to focus mode again
    if (focusMode) {
        document.querySelector("#board-controls-focus").click();
    }

    return {
        pgn,
        isWhite: username == null || pgn.includes(`[White "${username}"]`)
    };
}
