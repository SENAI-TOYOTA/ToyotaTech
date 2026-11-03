import { minify } from "vite";

const appRoots = {
  development: "http://localhost:3003",
  homolog: "https://vlibras.gov.br/app2",
  production: "/app",
  extension: null,
};

export type AppMode = keyof typeof appRoots;

type MinifyCodeOptions = {
  mode: AppMode;
  content: string;
  version: string;
};

export const minifyCode = async ({
  mode,
  content,
  version,
}: MinifyCodeOptions) => {
  let code = content;

  const appRoot = appRoots[mode];

  if (appRoot) {
    code = code.replaceAll("__APP_ROOT__", appRoot);
  }

  code = code.replaceAll("__APP_VERSION__", version);

  code = code.replace(/`([\s\S]*?)`/g, (_, p1) => {
    return `\`${p1
      .replace(/\r?\n/g, "")
      .replace(/\s{2,}/g, " ")
      .replaceAll("   ", "")
      .replaceAll(" />", "/>")
      .trim()}\``;
  });

  if (mode === "production" || mode === "extension") {
    const minified = await minify("index.js", code, {
      compress: true,
      mangle: true,
    });

    code = minified.code ?? code;
  }

  return code;
};

type VersionUnityManifestOptions = {
  content: string;
  version: string;
};

export const versionUnityManifest = ({
  content,
  version,
}: VersionUnityManifestOptions) => {
  return content.replace(
    /("(?:dataUrl|wasmCodeUrl|wasmFrameworkUrl)"\s*:\s*")([^"]+)(")/g,
    (_, pre, url, post) => `${pre}${url}?v=${version}${post}`,
  );
};
