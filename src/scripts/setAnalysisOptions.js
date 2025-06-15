(async () => {
    const { isWhite } = await chrome.runtime.sendMessage({ type: "getPgnResult" });

    await waitForElm("#analyse-toggle-ceval");
    await delay(1000);

    const evalToggle = document.querySelector("#analyse-toggle-ceval");
    if (!evalToggle.checked) {
        chrome.runtime.sendMessage({ type: "log", content: "enabling local evaluation" });
        document.querySelector("label[for=analyse-toggle-ceval]")?.click();
    }

    await delay(1000);

    if (isWhite || document.querySelector("coords.black")) return;

    // Flip board if black
    chrome.runtime.sendMessage({ type: "log", content: "flipping board" });
    showToastMessage("Flipping board...", 1500);
    const menuBtn = document.querySelector('[data-act="menu"]');
    menuBtn?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    await delay(500);

    document.querySelector(".action-menu__tools a")?.click();
})();
