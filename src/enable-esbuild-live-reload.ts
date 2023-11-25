// This file only does anything in live-reload builds.
// TODO: explore if we can inject this automatically into the html from inside the bundler?
declare global {
  const _LIVE_RELOAD_: boolean | undefined;
}

let hasAlreadyBeenEnabled = false;
_LIVE_RELOAD_ && enableEsbuildLiveReload();
/**
 * Call once per html file to enable live-reloading from esbuild's built-in `serve()` mode.
 * @see https://esbuild.github.io/api/#live-reload
 */
function enableEsbuildLiveReload(): void {
  if (hasAlreadyBeenEnabled) {
    return;
  }

  new EventSource("/esbuild").addEventListener("change", (e) => {
    const { added, removed, updated } = JSON.parse(e.data);

    // special case, update css only
    if (!added.length && !removed.length && updated.length === 1) {
      const existingLinks = document.getElementsByTagName("link");
      for (let i = 0; i < existingLinks.length; ++i) {
        const existingLink = existingLinks[i];
        const oldLinkUrl = new URL(existingLink.href);

        if (
          oldLinkUrl.host === location.host &&
          oldLinkUrl.pathname === updated[0]
        ) {
          const next = existingLink.cloneNode() as HTMLLinkElement;
          next.href = updated[0] + "?" + Math.random().toString(36).slice(2);
          next.onload = () => existingLink.remove();
          existingLink.parentNode!.insertBefore(next, existingLink.nextSibling);
          return;
        }
      }
    }

    location.reload();
  });
  hasAlreadyBeenEnabled = true;
}

export {};
