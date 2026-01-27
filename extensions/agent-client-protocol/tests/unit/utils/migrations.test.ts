
import { runMigrations } from "@/utils/migrations";
import { LocalStorage } from "@raycast/api";
import { STORAGE_KEYS, STORAGE_VERSION_KEY } from "@/utils/storageKeys";

// Mock Raycast API
jest.mock("@raycast/api");
const mockLocalStorage = jest.mocked(LocalStorage);

// Mock STORAGE_VERSION to be 1.2.0 so we can test migrations even if the real file says 1.0.0
jest.mock("@/utils/storageKeys", () => {
  const actual = jest.requireActual("@/utils/storageKeys");
  return {
    ...actual,
    STORAGE_VERSION: "1.2.0",
  };
});

describe("Migration Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should run all migrations for first time setup (version missing)", async () => {
    // Setup: Stateful mock
    const storage = new Map<string, string>();

    mockLocalStorage.getItem.mockImplementation((key) => Promise.resolve(storage.get(key) ?? null));
    mockLocalStorage.setItem.mockImplementation((key, value) => {
        storage.set(key, String(value));
        return Promise.resolve();
    });
    mockLocalStorage.allItems.mockImplementation(() => {
        const result: Record<string, string> = {};
        storage.forEach((v, k) => result[k] = v);
        return Promise.resolve(result);
    });

    const result = await runMigrations();

    expect(result.success).toBe(true);
    expect(result.fromVersion).toBe("0.0.0");
    expect(result.toVersion).toBe("1.2.0");
    // Should run 1.1.0 and 1.2.0 (1.0.0 is no-op)
    expect(result.migrationsApplied).toContain("1.1.0");
    expect(result.migrationsApplied).toContain("1.2.0");

    // Should update version key
    expect(storage.get(STORAGE_VERSION_KEY)).toBe("1.2.0");
  });

  it("should run pending migrations when upgrading from 1.0.0 to 1.2.0", async () => {
    // Setup: Stateful mock with initial data
    const storage = new Map<string, string>();
    storage.set(STORAGE_VERSION_KEY, "1.0.0");
    storage.set(STORAGE_KEYS.CONVERSATIONS, JSON.stringify([
            {
                sessionId: "sess-1",
                messages: [{ id: "msg-1", role: "user", content: "test", timestamp: new Date(), metadata: {} }],
                agentConnectionId: "agent-conn-1" // Old field
            }
    ]));

    mockLocalStorage.getItem.mockImplementation((key) => Promise.resolve(storage.get(key) ?? null));
    mockLocalStorage.setItem.mockImplementation((key, value) => {
        storage.set(key, String(value));
        return Promise.resolve();
    });
    mockLocalStorage.allItems.mockImplementation(() => {
        const result: Record<string, string> = {};
        storage.forEach((v, k) => result[k] = v);
        return Promise.resolve(result);
    });

    const result = await runMigrations();

    expect(result.success).toBe(true);
    expect(result.fromVersion).toBe("1.0.0");
    expect(result.migrationsApplied).toEqual(["1.1.0", "1.2.0"]);

    // Verify backup created (key starts with backup prefix)
    const backupKeys = Array.from(storage.keys()).filter(k => k.includes("backup_1.0.0_"));
    expect(backupKeys.length).toBeGreaterThan(0);

    // Verify final state
    const finalConversations = JSON.parse(storage.get(STORAGE_KEYS.CONVERSATIONS)!);
    const conversation = finalConversations[0];

    // Check 1.1.0: sequence added
    expect(conversation.messages[0].metadata.sequence).toBe(0);

    // Check 1.2.0: agentConnectionId -> agentConfigId
    expect(conversation.agentConfigId).toBe("agent-conn-1");
    expect(conversation.agentConnectionId).toBeUndefined();
  });

  it("should do nothing if version matches", async () => {
    const storage = new Map<string, string>();
    storage.set(STORAGE_VERSION_KEY, "1.2.0");

    mockLocalStorage.getItem.mockImplementation((key) => Promise.resolve(storage.get(key) ?? null));

    const result = await runMigrations();

    expect(result.success).toBe(true);
    expect(result.migrationsApplied).toHaveLength(0);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });
});
