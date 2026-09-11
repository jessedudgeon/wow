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
        timeoutId = setTimeout(
          () => reject(new Error("connection timeout")),
          TIMEOUT_MS
        );
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
        // Failed sockets may already be closed.
      }
    }
  }
}

export async function onRequestGet() {
  const [auth, world] = await Promise.all([
    checkPort(AUTH_PORT),
    checkPort(WORLD_PORT),
  ]);

  return new Response(
    JSON.stringify({
      realm: "Dudgeon Wrath",
      host: REALM_HOST,
      online: auth.online && world.online,
      auth,
      world,
      checkedAt: new Date().toISOString(),
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "x-content-type-options": "nosniff",
      },
    }
  );
}
