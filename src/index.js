import { connect } from "cloudflare:sockets";

const REALM_HOST = "wowclient.dudgeon.io";
const AUTH_PORT = 3724;
const WORLD_PORT = 8085;
const TIMEOUT_MS = 2500;

async function checkPort(port) {
  const started = Date.now();
  let socket;
  let timeoutId;

  try {
    socket = connect(
      { hostname: REALM_HOST, port },
      { secureTransport: "off", allowHalfOpen: false }
    );

    await Promise.race([
      socket.opened,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("connection timeout")), TIMEOUT_MS);
      }),
    ]);

    return {
      online: true,
      port,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      online: false,
      port,
      latencyMs: null,
      error: error instanceof Error ? error.message : "connection failed",
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);

    if (socket) {
      try {
        await socket.close();
      } catch {
        // Failed connections may already have a closed socket.
      }
    }
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }

      const [auth, world] = await Promise.all([
        checkPort(AUTH_PORT),
        checkPort(WORLD_PORT),
      ]);

      return jsonResponse({
        realm: "Dudgeon Wrath",
        host: REALM_HOST,
        online: auth.online && world.online,
        auth,
        world,
        checkedAt: new Date().toISOString(),
      });
    }

    return env.ASSETS.fetch(request);
  },
};
