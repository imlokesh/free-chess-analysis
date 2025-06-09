function showToastMessage(text, timeout = 4000) {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";

        Object.assign(container.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: "99999",
            pointerEvents: "none"
        });

        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const icon = document.createElement("img");
    const message = document.createElement("span");
    const closeBtn = document.createElement("button");
    const progress = document.createElement("div");

    Object.assign(toast.style, {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        background: "rgba(255,255,255,0.95)",
        color: "#111",
        fontSize: "14px",
        fontWeight: "500",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "10px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
        overflow: "hidden",
        pointerEvents: "auto",
        opacity: "0",
        transform: "translateX(20px)",
        transition: "opacity 0.4s ease, transform 0.4s ease"
    });

    Object.assign(icon.style, {
        width: "24px",
        height: "24px",
        borderRadius: "6px",
        flexShrink: "0"
    });
    icon.src = chrome.runtime.getURL("img/48.png");
    icon.alt = "Logo";

    message.textContent = text;

    Object.assign(closeBtn.style, {
        background: "transparent",
        border: "none",
        color: "#666",
        fontSize: "18px",
        fontWeight: "bold",
        cursor: "pointer",
        lineHeight: "1",
        padding: "0 4px",
        marginLeft: "auto"
    });
    closeBtn.textContent = "×";

    closeBtn.onclick = () => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 400);
    };

    Object.assign(progress.style, {
        position: "absolute",
        bottom: "0",
        left: "0",
        height: "3px",
        background: "#0a84ff",
        width: "100%",
        transformOrigin: "left",
        animation: `toast-progress ${timeout}ms linear forwards`
    });

    // Keyframes for animation (added only once)
    if (!document.getElementById("toast-progress-style")) {
        const style = document.createElement("style");
        style.id = "toast-progress-style";
        style.textContent = `
      @keyframes toast-progress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }
    `;
        document.head.appendChild(style);
    }

    toast.append(icon, message, closeBtn, progress);
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    });

    const autoRemove = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 400);
    }, timeout);

    // Cancel auto-remove if closed manually
    closeBtn.addEventListener("click", () => clearTimeout(autoRemove));
}

function waitForElm(selector) {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const found = document.querySelector(selector);
            if (found) {
                observer.disconnect();
                resolve(found);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
