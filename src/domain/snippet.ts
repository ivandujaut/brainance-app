const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The one-line <script> a site owner pastes into their site to load the chat widget. */
export const buildInstallSnippet = ({ appUrl, domainId }: { appUrl: string; domainId: string }): string => {
  const url = new URL(appUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`Invalid app URL: ${appUrl}`);
  if (!UUID.test(domainId)) throw new Error(`Invalid domain id: ${domainId}`);
  const origin = url.origin;
  return `<script src="${origin}/widget.js" data-domain-id="${domainId}" async></script>`;
};
