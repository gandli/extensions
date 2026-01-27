import { renderHook, waitFor } from "@testing-library/react";
import { useCreateObjectData } from "./useCreateObjectData";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as RaycastUtils from "@raycast/utils";

// Mock @raycast/api to avoid resolution errors
vi.mock("@raycast/api", () => ({
  showToast: vi.fn(),
  Toast: { Style: { Animated: "animated", Success: "success", Failure: "failure" } },
  getPreferenceValues: () => ({ apiUrl: "http://localhost" }),
  Form: { Dropdown: () => null },
  ActionPanel: () => null,
  Action: { SubmitForm: () => null },
  Icon: {},
  popToRoot: vi.fn(),
}));

// Mock dependencies
vi.mock("./useSpaces", () => ({
  useSpaces: () => ({ spaces: [], isLoadingSpaces: false, spacesError: undefined }),
}));

vi.mock("./useSearch", () => ({
  useSearch: () => ({ objects: [], isLoadingObjects: false, objectsError: undefined }),
}));

vi.mock("./useMembers", () => ({
  useMembers: () => ({ members: [], isLoadingMembers: false, membersError: undefined }),
}));

// Mock @raycast/utils fully to avoid importing the real one which depends on @raycast/api
vi.mock("@raycast/utils", () => {
  return {
    useCachedPromise: vi.fn(() => ({ data: [], isLoading: false, error: undefined })),
    useLocalStorage: vi.fn(() => ({ value: undefined, setValue: vi.fn(), isLoading: false })),
    showFailureToast: vi.fn(),
  };
});

describe("useCreateObjectData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize selectedTypeId from storage when no initialValues provided", async () => {
    const setStoredValue = vi.fn();
    vi.mocked(RaycastUtils.useLocalStorage).mockReturnValue({
      value: "stored-type-id",
      setValue: setStoredValue,
      isLoading: false,
      removeValue: vi.fn(),
    });

    const { result } = renderHook(() => useCreateObjectData(undefined));

    // Initially it might be empty depending on implementation, but eventually it should sync
    await waitFor(() => {
        expect(result.current.selectedTypeId).toBe("stored-type-id");
    });
  });

  it("should prioritize initialValues over storage", async () => {
    const setStoredValue = vi.fn();
    vi.mocked(RaycastUtils.useLocalStorage).mockReturnValue({
      value: "stored-type-id",
      setValue: setStoredValue,
      isLoading: false,
      removeValue: vi.fn(),
    });

    const initialValues: any = { typeId: "initial-type-id" };
    const { result } = renderHook(() => useCreateObjectData(initialValues));

    expect(result.current.selectedTypeId).toBe("initial-type-id");

    // Ensure it doesn't switch to stored value later
    await waitFor(() => {
        expect(result.current.selectedTypeId).toBe("initial-type-id");
    });
  });

  it("should update storage when state changes", async () => {
    const setStoredValue = vi.fn();
    vi.mocked(RaycastUtils.useLocalStorage).mockReturnValue({
      value: undefined,
      setValue: setStoredValue,
      isLoading: false,
      removeValue: vi.fn(),
    });

    const { result } = renderHook(() => useCreateObjectData(undefined));

    // Change value
    await waitFor(() => {
       result.current.setSelectedTypeId("new-type-id");
    });

    await waitFor(() => {
        expect(setStoredValue).toHaveBeenCalledWith("new-type-id");
    });
  });
});
