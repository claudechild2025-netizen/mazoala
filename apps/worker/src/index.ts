import { resolveWednesdayPeriod } from "@mazoala/domain";

console.log("[Worker] MAZOALA Worker starting...");
console.log(`[Worker] Timezone: ${process.env.BUSINESS_TIMEZONE ?? "Asia/Ulaanbaatar"}`);
console.log(`[Worker] Report scheduler enabled: ${process.env.REPORT_SCHEDULER_ENABLED === "true"}`);

async function runWorkerLoop() {
  const pollIntervalMs = parseInt(process.env.WORKER_POLL_INTERVAL_MS ?? "3000", 10);
  console.log(`[Worker] Polling outbox every ${pollIntervalMs}ms...`);

  // Periodic heartbeat / outbox runner
  setInterval(() => {
    // In a real DB connection, locks lease on pending outbox_events and processes
    // console.log("[Worker] Outbox heartbeat - 0 pending tasks");
  }, pollIntervalMs);
}

runWorkerLoop().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
