(() => {
  const vw = (window.VLibrasWidget = Object.assign(
    { path: "__APP_ROOT__" },
    window.VLibrasWidget,
  ));

  (window.VLibras = window.VLibras || {}).Widget = function (
    path,
    personalization,
    avatar,
    position,
  ) {
    const cfg =
      path && typeof path === "object"
        ? path
        : { rootPath: path, personalization, avatar, position };

    Object.assign(vw, {
      path: cfg.rootPath || vw.path,
      personalization: cfg.personalization,
      avatar: cfg.avatar,
      position: cfg.position,
      showButton: cfg.showButton !== false,
    });

    render();
  };

  let isRendered = false;
  let widget;
  let loading = false;

  const setActive = (auto = false) => {
    if (!widget) return;

    widget.dataset.active = "true";
    widget.dataset.auto = String(auto);
  };

  function open(auto = false) {
    if (widget) {
      setActive(auto);
      return;
    }

    if (loading) return;
    loading = true;

    const script = document.createElement("script");
    script.type = "module";
    script.src = `${vw.path}/vlibras-plugin-app.js?v=__APP_VERSION__`;
    script.async = true;

    script.onload = () => {
      loading = false;
      widget = document.getElementById("vlibras-app-root");
      setActive(auto);
    };

    script.onerror = () => {
      loading = false;
      console.error("[VLibras] Não foi possível carregar o aplicativo.");
    };

    document.body.appendChild(script);
  }

  function toggle(shouldOpen) {
    const next = shouldOpen ?? widget?.dataset.active !== "true";

    if (next) {
      open();
    } else if (widget) {
      widget.dataset.active = "false";
    }
  }

  vw.open = open;
  vw.toggle = toggle;

  function render() {
    if (isRendered) return;
    isRendered = true;

    const currentPath = vw.path;
    const position = vw.position?.toLowerCase() === "l" ? "left" : "right";

    const template = `
      <div id="vlibras-access">
        <img id="vlibras-popup" src="${currentPath}/assets/images/vlibras-popup.webp" alt="" aria-hidden="true" />
        <button type="button" aria-label="Conteúdo acessível em Libras pelo VLibras" aria-expanded="false" id="vlibras-button">
          <img src="${currentPath}/assets/images/vlibras-access.svg" alt="" aria-hidden="true" />
        </button>
      </div>
      <style>
        #vlibras-access {
          display: flex;
          align-items: center;
          position: fixed;
          z-index: 2147483639;
          ${position}: 10px;
          flex-direction: ${position === "left" ? "row-reverse" : "row"};
          top: calc(50vh - 20px);
          transition: all .5s ease;
          width: 40px;
          height: 40px;
        }

        #vlibras-access:hover,
        #vlibras-access:has(#vlibras-button:focus-visible) {
          width: 200px;
        }

        #vlibras-button,
        #vlibras-popup {
          border-radius: 8px;
          overflow: hidden;
          height: 40px;
        }

        #vlibras-button {
          ${position}: 0;
          z-index: 1;
          position: absolute;
          width: 40px;
          border: none;
          padding: 0;
          cursor: pointer;
          outline: var(--vlibras-btn-outline);
        }

        #vlibras-button:focus-visible {
          outline: var(--vlibras-btn-focus-visible-outline, 2px solid #fff);
          box-shadow: var(--vlibras-btn-focus-visible-shadow, 0 0 10px 4px #1351b4);
        }

        #vlibras-button:hover {
          filter: var(--vlibras-btn-hover-filter, brightness(1.1));
        }

        @media (prefers-reduced-motion: reduce) {
          #vlibras-access {
            transition: none;
          }
        }
      </style>
    `;

    if (vw.showButton) {
      const wrapper = document.createElement("div");
      const shadow = wrapper.attachShadow({ mode: "open" });

      wrapper.id = "vlibras-access-wrapper";
      shadow.innerHTML = template;
      document.body.appendChild(wrapper);

      const initBtn = shadow.querySelector("#vlibras-button");
      const access = shadow.querySelector("#vlibras-access");

      if (initBtn) {
        initBtn.addEventListener("click", () => open(false));
        vw.initBtn = initBtn;
      }

      vw.access = access;

      try {
        if (localStorage["@vlibras-widget"]?.includes('"isOpen":true')) {
          open(true);
        }
      } catch {
        // O armazenamento local pode estar indisponível.
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    setTimeout(render, 50);
  }
})();
