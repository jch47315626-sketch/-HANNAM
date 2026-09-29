// Claude Artifact용 단일 HTML 빌드.
// 같은 화면 코드(src/)를 next/navigation·next/link 대신 메모리 라우터로 묶는다.
// 사용: npm run build:artifact  →  artifact/dist/hannam-ilnyeo.html
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "artifact/dist");
mkdirSync(out, { recursive: true });

const js = await build({
  entryPoints: [resolve(root, "artifact/main.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  target: "es2020",
  tsconfig: resolve(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/navigation": resolve(root, "artifact/shims/navigation.ts"),
    "next/link": resolve(root, "artifact/shims/link.tsx"),
  },
  logLevel: "warning",
});

const cssFile = resolve(out, "app.css");
execFileSync(
  resolve(root, "node_modules/.bin/tailwindcss"),
  ["-i", resolve(root, "src/app/globals.css"), "-o", cssFile, "--minify"],
  { cwd: root, stdio: "inherit" },
);

const script = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = readFileSync(cssFile, "utf8").replace(/<\/style/gi, "<\\/style");

const html = `<title>한남일녀</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap">
<style>${css}
:root{--font-sans:"Noto Sans KR","Apple SD Gothic Neo","Noto Sans JP","Hiragino Sans",system-ui,sans-serif}
html,body{font-family:var(--font-sans)}
</style>
<div id="app"></div>
<script>${script}</script>
`;

writeFileSync(resolve(out, "hannam-ilnyeo.html"), html);
console.log(`artifact/dist/hannam-ilnyeo.html  ${(html.length / 1024).toFixed(0)} KB`);
