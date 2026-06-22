export type VisitorLocation = {
  city: string;
  region: string;
};

type VisitorStore = {
  lastVisitor: VisitorLocation | null;
};

const globalStore = globalThis as typeof globalThis & {
  __visitorStore?: VisitorStore;
};

function getStore(): VisitorStore {
  if (!globalStore.__visitorStore) {
    globalStore.__visitorStore = { lastVisitor: null };
  }

  return globalStore.__visitorStore;
}

export function getLastVisitor() {
  return getStore().lastVisitor;
}

export function setLastVisitor(location: VisitorLocation) {
  getStore().lastVisitor = location;
}
