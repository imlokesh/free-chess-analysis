chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getPgnResult") sendResponse(pgnResult);
    if (message.type === "log") console.log(message.content);
});

const rule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: ".chess.com", schemes: ["https"] }
        })
    ],
    actions: [new chrome.declarativeContent.ShowAction()]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([rule]);
    });
});

let lichessTab = null;
let pgnResult = null;

chrome.action.onClicked.addListener(async (tab) => {
    pgnResult = null;
    lichessTab = null;

    // Extract PGN from current chess.com tab
    [{ result: pgnResult }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/common.js", "scripts/getPgn.js"]
    });

    // Open lichess paste tab next to current
    lichessTab = await chrome.tabs.create({
        url: "https://lichess.org/paste",
        index: tab.index + 1
    });

    chrome.tabs.onUpdated.addListener(lichessImport);
});

async function lichessImport(id, changeInfo) {
    if (id !== lichessTab.id || changeInfo.status !== "complete") return;

    chrome.tabs.onUpdated.removeListener(lichessImport);
    chrome.tabs.onUpdated.addListener(lichessAfterImport);

    await chrome.scripting.executeScript({
        target: { tabId: lichessTab.id },
        files: ["scripts/common.js", "scripts/fillPgn.js"]
    });
}

async function lichessAfterImport(id, changeInfo) {
    if (id !== lichessTab.id || changeInfo.status !== "complete") return;
    chrome.tabs.onUpdated.removeListener(lichessAfterImport);

    await chrome.scripting.executeScript({
        target: { tabId: lichessTab.id },
        files: ["scripts/common.js", "scripts/setAnalysisOptions.js"]
    });
}
