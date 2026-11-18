import { existsSync } from "fs";
import { join } from "path";

const PUBLIC_DIR = join(import.meta.dir, "public");

const server = Bun.serve({
  port: 8095,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === "/" || pathname === "") pathname = "/dual_emulator.html";
    const filePath = join(PUBLIC_DIR, pathname);
    if (existsSync(filePath)) {
      return new Response(Bun.file(filePath));
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server listening on http://0.0.0.0:${server.port}`);
