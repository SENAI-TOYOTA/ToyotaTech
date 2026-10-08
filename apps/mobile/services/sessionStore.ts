import { StoredSession } from "./sessionStorage.types";

type Listener = (session: StoredSession | null) => void;

type SessionOps = {
  renew: (current: StoredSession) => Promise<StoredSession>;
  drop: () => Promise<void>;
};

let current: StoredSession | null = null;
let renewal: Promise<StoredSession> | null = null;
let ops: SessionOps | null = null;
const listeners = new Set<Listener>();

export function getSession(): StoredSession | null {
  return current;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of Array.from(listeners)) {
    listener(current);
  }
}

export function putSession(session: StoredSession | null): void {
  current = session;
  emit();
}

export function registerSessionOps(next: SessionOps | null): void {
  ops = next;
}

async function performRenewal(session: StoredSession): Promise<StoredSession> {
  if (!ops) {
    throw new Error("Session ops not registered.");
  }
  const renewed = await ops.renew(session);
  current = renewed;
  emit();
  return renewed;
}

export function renewSession(): Promise<StoredSession> {
  if (renewal) {
    return renewal;
  }
  const session = current;
  if (!session) {
    return Promise.reject(new Error("No session to renew."));
  }
  const attempt = performRenewal(session);
  renewal = attempt;
  const release = () => {
    if (renewal === attempt) {
      renewal = null;
    }
  };
  attempt.then(release, release);
  return attempt;
}

export async function clearSession(): Promise<void> {
  if (ops) {
    await ops.drop();
  }
  current = null;
  emit();
}

export function resetSessionStore(): void {
  current = null;
  renewal = null;
  ops = null;
  listeners.clear();
}
