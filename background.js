const rule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.chess.com', schemes: ['https'] } })
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

    pgnResult = (await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getPgn
    }))[0].result;

    lichessTab = await chrome.tabs.create({ url: "https://lichess.org/paste", index: tab.index + 1 });
    chrome.tabs.onUpdated.addListener(lichessImport);
});

async function lichessImport(id, changeInfo, tab) {
    if (id != lichessTab.id || changeInfo?.status != 'complete') {
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
    if (id != lichessTab.id || changeInfo?.status != 'complete') {
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
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
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

    function simulateKey(target, keyCode, eventName) {
        const event = new KeyboardEvent(eventName, { keyCode });
        target.dispatchEvent(event);
    }

    function sendKey(element, key) {
        const keyCode = key.charCodeAt(0);
        simulateKey(element, keyCode, "keydown");
        simulateKey(element, keyCode, "keyup");
        simulateKey(element, keyCode, "keypress");
    }

    await waitForElm('.switch');

    setTimeout(() => {
        sendKey(document, 'l');
    }, 1000);

    setTimeout(() => {
        if (isWhite || document.querySelector('coords.black')) return;
        sendKey(document, 'f');
    }, 2000);
}

async function fillPgn(pgnResult) {

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
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

    (await waitForElm('#form3-pgn')).value = pgnResult.pgn;
    (await waitForElm('#form3-analyse')).click();
    (await waitForElm('form.form3 button[type=submit]')).click();
}

async function getPgn() {

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
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

    let username = document.querySelectorAll('[data-test-element="user-tagline-username"]')[1].text;

    (await waitForElm('button[data-cy="daily-games-share-btn"],button[data-cy="sidebar-share-button"]')).click();
    (await waitForElm('.share-menu-tab-selector-component .share-menu-tab-selector-tab')).click();
    let pgn = (await waitForElm('textarea[name=pgn]')).value;
    (await waitForElm('[data-cy="share-menu-close"]')).click();

    return {
        pgn, isWhite: pgn.includes(`[White "${username}"]`)
    }
}