(async () => {
    const { isWhite } = await chrome.runtime.sendMessage({ type: "getPgnResult" });

    await waitForElm("#cmn-tg-analyse-toggle-ceval");
    await delay(1000);

    const evalToggle = document.querySelector("#cmn-tg-analyse-toggle-ceval");
    if (!evalToggle.checked) {
        chrome.runtime.sendMessage({ type: "log", content: "enabling local evaluation" });
        document.querySelector('label[for="cmn-tg-analyse-toggle-ceval"]')?.click();
    }

    await delay(1000);

    if (isWhite || document.querySelector(".cg-wrap.orientation-black")) return;

    // Flip board if black
    chrome.runtime.sendMessage({ type: "log", content: "flipping board" });
    showToastMessage("Flipping board...", 1500);

    const menuBtn = document.querySelector('[data-act="menu"]');
    menuBtn?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    const actionMenu = await waitForElm(".action-menu, .action-menu__tools");
    await delay(500);

    [...actionMenu.querySelectorAll("button, a")]
        .find((el) => {
            const text =
                `${el.textContent || ""} ${el.getAttribute("title") || ""} ${el.getAttribute("aria-label") || ""}`.toLowerCase();
            return text.includes("flip");
        })
        ?.click();
})();
