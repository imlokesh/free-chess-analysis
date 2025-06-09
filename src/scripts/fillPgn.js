(async () => {
    showToastMessage("Filling pgn...");
    const pgnResult = await chrome.runtime.sendMessage({ type: "getPgnResult" });
    (await waitForElm("#form3-pgn")).value = pgnResult.pgn;
    (await waitForElm("#form3-analyse")).click();
    (await waitForElm("form.form3 button[type=submit]")).click();
})();
