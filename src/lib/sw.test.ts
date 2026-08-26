import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Exercises the real public/sw.js rather than a copy of its rules: the file is
 * loaded into a sandbox with stand-ins for the worker globals, and requests are
 * driven through the fetch handler it registers.
 */

const ORIGIN = "https://party.test";

class FakeCache {
  entries = new Map<string, Response>();
  async match(request: Request | string, options?: { ignoreSearch?: boolean }) {
    // The real Cache API resolves a relative URL against the worker scope.
    const url = toAbsolute(request);
    const key = options?.ignoreSearch ? stripSearch(url) : url;
    for (const [storedUrl, response] of this.entries) {
      const stored = options?.ignoreSearch ? stripSearch(storedUrl) : storedUrl;
      if (stored === key) return response.clone();
    }
    return undefined;
  }
  async put(request: Request | string, response: Response) {
    this.entries.set(toAbsolute(request), response);
  }
  async addAll(urls: string[]) {
    for (const url of urls) {
      this.entries.set(new URL(url, ORIGIN).toString(), new Response("offline page"));
    }
  }
}

function toAbsolute(request: Request | string): string {
  const url = typeof request === "string" ? request : request.url;
  return new URL(url, ORIGIN).toString();
}

function stripSearch(url: string) {
  const parsed = new URL(url);
  parsed.search = "";
  return parsed.toString();
}

class FakeCacheStorage {
  stores = new Map<string, FakeCache>();
  async open(name: string) {
    if (!this.stores.has(name)) this.stores.set(name, new FakeCache());
    return this.stores.get(name)!;
  }
  async match(request: Request | string, options?: { ignoreSearch?: boolean }) {
    for (const cache of this.stores.values()) {
      const hit = await cache.match(request, options);
      if (hit) return hit;
    }
    return undefined;
  }
  async keys() {
    return [...this.stores.keys()];
  }
  async delete(name: string) {
    return this.stores.delete(name);
  }
}

type Listener = (event: {
  request: Request;
  respondWith: (r: Promise<Response> | Response) => void;
  waitUntil: (p: Promise<unknown>) => void;
}) => void;

let listeners: Record<string, Listener>;
let cacheStorage: FakeCacheStorage;
let network: (request: Request) => Promise<Response>;

function loadWorker() {
  listeners = {};
  cacheStorage = new FakeCacheStorage();

  const selfStub = {
    addEventListener: (type: string, fn: Listener) => {
      listeners[type] = fn;
    },
    location: { origin: ORIGIN },
    skipWaiting: () => {},
    clients: { claim: async () => {} },
  };

  const code = readFileSync(resolve("public/sw.js"), "utf8");
  const run = new Function("self", "caches", "fetch", "Response", code);
  run(selfStub, cacheStorage, (r: Request) => network(r), Response);
}

/** Drive one request through the worker; null means it did not intercept. */
async function handle(
  url: string,
  init: { method?: string; mode?: string; headers?: Record<string, string> } = {},
): Promise<Response | null> {
  const request = new Request(new URL(url, ORIGIN), {
    method: init.method ?? "GET",
    headers: init.headers,
  });
  Object.defineProperty(request, "mode", { value: init.mode ?? "navigate" });

  let responded: Promise<Response> | Response | null = null;
  listeners.fetch({
    request,
    respondWith: (r) => {
      responded = r;
    },
    waitUntil: () => {},
  });
  return responded ? await responded : null;
}

async function install() {
  const waits: Promise<unknown>[] = [];
  // @ts-expect-error - install events carry no request
  listeners.install({ waitUntil: (p: Promise<unknown>) => waits.push(p) });
  await Promise.all(waits);
}

beforeEach(() => {
  network = async () => new Response("from network", { status: 200 });
  loadWorker();
});

describe("service worker caching rules", () => {
  it("registers install, activate and fetch handlers", () => {
    expect(Object.keys(listeners).sort()).toEqual([
      "activate",
      "fetch",
      "install",
    ]);
  });

  it("precaches the offline page on install", async () => {
    await install();
    const hit = await cacheStorage.match(`${ORIGIN}/offline`);
    expect(hit).toBeDefined();
  });

  it("never intercepts a POST", async () => {
    expect(await handle("/anything", { method: "POST" })).toBeNull();
  });

  it("never intercepts the auth API", async () => {
    expect(await handle("/api/auth/session")).toBeNull();
  });

  it("never intercepts the admin area", async () => {
    expect(await handle("/admin")).toBeNull();
  });

  it("never intercepts a React server component payload", async () => {
    expect(await handle("/charades?_rsc=abc")).toBeNull();
    expect(
      await handle("/charades", { headers: { accept: "text/x-component" } }),
    ).toBeNull();
  });

  it("ignores other origins", async () => {
    expect(await handle("https://elsewhere.test/thing")).toBeNull();
  });

  it("caches a page that loaded successfully", async () => {
    await handle("/charades");
    expect(await cacheStorage.match(`${ORIGIN}/charades`)).toBeDefined();
  });

  it("does not cache an error page", async () => {
    network = async () => new Response("boom", { status: 500 });
    await handle("/charades");
    expect(await cacheStorage.match(`${ORIGIN}/charades`)).toBeUndefined();
  });

  it("serves a visited page from cache when the network is gone", async () => {
    await handle("/charades");
    network = async () => {
      throw new Error("offline");
    };
    const response = await handle("/charades");
    expect(await response!.text()).toBe("from network");
  });

  it("falls back to the offline page for somewhere never visited", async () => {
    await install();
    network = async () => {
      throw new Error("offline");
    };
    const response = await handle("/never-been-here");
    expect(await response!.text()).toBe("offline page");
  });

  it("serves hashed build assets from cache without refetching", async () => {
    let calls = 0;
    network = async () => {
      calls++;
      return new Response("chunk", { status: 200 });
    };
    await handle("/_next/static/chunks/app.js", { mode: "no-cors" });
    await handle("/_next/static/chunks/app.js", { mode: "no-cors" });
    expect(calls).toBe(1);
  });
});
