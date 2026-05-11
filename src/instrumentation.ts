// Runs once when the Next.js server starts, in every worker process.
// We use it to force Node.js to prefer IPv4 addresses when resolving
// hostnames — the network we run on can't route IPv6 to AWS/Cloudflare,
// which would otherwise hang every Neon DB query and Clerk API call.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
    console.log("[instrumentation] DNS preference set to ipv4first");
  }
}
