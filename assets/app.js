const $ = (selector) => document.querySelector(selector);

const overallOrb = $("#overall-orb");
const overallStatus = $("#overall-status");
const statusDetail = $("#status-detail");
const authStatus = $("#auth-status");
const worldStatus = $("#world-status");
const authLatency = $("#auth-latency");
const worldLatency = $("#world-latency");
const checkedAt = $("#checked-at");
const refreshButton = $("#refresh-status");
const toast = $("#toast");

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Realmlist copied");
  } catch {
    showToast("Copy failed — select the text manually");
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyToClipboard(button.dataset.copy));
});

function setChecking() {
  overallOrb.className = "status-orb checking";
  overallStatus.textContent = "Checking realm…";
  statusDetail.textContent = "Testing the public realm endpoints.";
  authStatus.textContent = "Checking";
  worldStatus.textContent = "Checking";
  authLatency.textContent = "—";
  worldLatency.textContent = "—";
  refreshButton.disabled = true;
}

function latencyText(service) {
  return service?.online && Number.isFinite(service.latencyMs)
    ? `${service.latencyMs} ms`
    : "—";
}

function renderStatus(data) {
  const authOnline = Boolean(data.auth?.online);
  const worldOnline = Boolean(data.world?.online);

  authStatus.textContent = authOnline ? "Online" : "Offline";
  worldStatus.textContent = worldOnline ? "Online" : "Offline";
  authLatency.textContent = latencyText(data.auth);
  worldLatency.textContent = latencyText(data.world);

  if (authOnline && worldOnline) {
    overallOrb.className = "status-orb online";
    overallStatus.textContent = "Realm Online";
    statusDetail.textContent = "Authentication and world services are accepting connections.";
  } else if (authOnline || worldOnline) {
    overallOrb.className = "status-orb partial";
    overallStatus.textContent = "Partially Online";
    statusDetail.textContent = authOnline
      ? "Authentication is reachable, but the world server is not."
      : "The world server port is reachable, but authentication is not.";
  } else {
    overallOrb.className = "status-orb offline";
    overallStatus.textContent = "Realm Offline";
    statusDetail.textContent = "The public realm endpoints are not currently accepting connections.";
  }

  const checked = data.checkedAt ? new Date(data.checkedAt) : new Date();
  checkedAt.textContent = `Last checked ${checked.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  })}`;
}

async function loadStatus() {
  setChecking();

  try {
    const response = await fetch("/api/status", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Status endpoint returned ${response.status}`);
    }

    renderStatus(await response.json());
  } catch (error) {
    console.error(error);
    overallOrb.className = "status-orb offline";
    overallStatus.textContent = "Status Unavailable";
    statusDetail.textContent = "The website is online, but the realm status check could not complete.";
    authStatus.textContent = "Unknown";
    worldStatus.textContent = "Unknown";
    authLatency.textContent = "—";
    worldLatency.textContent = "—";
    checkedAt.textContent = "Status service unavailable";
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadStatus);

loadStatus();
setInterval(loadStatus, 30_000);
