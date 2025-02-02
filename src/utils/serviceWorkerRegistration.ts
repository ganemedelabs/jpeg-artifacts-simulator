// Register the service worker
export function register() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/service-worker.js", { scope: "/" })
            .then((registration) => {
                console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch((error) => {
                console.error("Service Worker registration failed:", error);
            });
    }
}

// Unregister the service worker
export function unregister() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
