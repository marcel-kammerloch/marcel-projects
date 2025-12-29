import Script from "next/script";

export function ServiceWorker() {
  return (
    <Script id="service-worker">
      {`if ("serviceWorker" in navigator && location.protocol === "https:") { navigator.serviceWorker.register("/sw.js").then(() => console.log("Service Worker registered")).catch(console.error); }`}
    </Script>
  );
}
