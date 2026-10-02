/* BrAInance chat widget loader (spec 003). Usage:
 * <script src="https://<app>/widget.js" data-domain-id="<site id>" async></script>
 */
(function () {
  var script = document.currentScript;
  if (!script || window.__brainanceWidget) return;
  window.__brainanceWidget = true;

  var origin = new URL(script.src).origin;
  var domainId = script.getAttribute("data-domain-id") || "";
  var warn = function (message) {
    console.warn("[BrAInance] " + message);
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(domainId)) {
    return warn("data-domain-id no es válido. Copiá el código de instalación desde tu panel.");
  }

  fetch(origin + "/api/widget/" + domainId + "/config")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(mount)
    .catch(function () {
      warn("No encontramos este sitio. Revisá el código de instalación en tu panel.");
    });

  function mount(config) {
    var mobile = window.matchMedia("(max-width: 640px)");
    var frame = null;
    var open = false;

    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Abrir chat");
    button.setAttribute("data-brainance", "launcher");
    button.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    style(button, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,.2)",
      background: config.background,
      color: config.textColor,
      zIndex: "2147483000",
    });

    function layout() {
      if (!frame) return;
      var full = mobile.matches;
      style(frame, {
        display: open ? "block" : "none",
        right: full ? "0" : "20px",
        bottom: full ? "0" : "88px",
        width: full ? "100%" : "380px",
        height: full ? "100%" : "600px",
        maxHeight: full ? "100%" : "calc(100% - 108px)",
        borderRadius: full ? "0" : "16px",
      });
      button.style.display = open && full ? "none" : "flex";
    }

    function toggle(next) {
      open = next;
      if (open && !frame) {
        frame = document.createElement("iframe");
        frame.src = origin + "/widget/" + domainId;
        frame.title = "Chat con " + config.name;
        frame.setAttribute("data-brainance", "chat");
        style(frame, {
          position: "fixed",
          border: "none",
          boxShadow: "0 8px 32px rgba(0,0,0,.2)",
          background: "transparent",
          zIndex: "2147483000",
        });
        document.body.appendChild(frame);
      }
      button.setAttribute("aria-label", open ? "Cerrar chat" : "Abrir chat");
      layout();
    }

    button.addEventListener("click", function () {
      toggle(!open);
    });
    window.addEventListener("message", function (event) {
      if (event.origin === origin && event.data && event.data.type === "brainance:close") toggle(false);
    });
    mobile.addEventListener("change", layout);
    document.body.appendChild(button);
  }

  function style(element, rules) {
    for (var key in rules) element.style[key] = rules[key];
  }
})();
