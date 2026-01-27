import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ObjectLayout, PropertyFormat } from "../../models";
import { CreateObjectForm } from "./CreateObjectForm";

// Mock Raycast API
vi.mock("@raycast/api", () => {
  const Form = Object.assign(
    vi.fn(({ children }) => <div>{children}</div>),
    {
      TextField: vi.fn(() => null),
      TextArea: vi.fn(() => null),
      Dropdown: Object.assign(
        vi.fn(({ children }) => <div>{children}</div>),
        {
          Item: vi.fn(() => null),
        },
      ),
      TagPicker: Object.assign(
        vi.fn(() => null),
        {
          Item: vi.fn(() => null),
        },
      ),
      DatePicker: vi.fn(() => null),
      Checkbox: vi.fn(() => null),
      FilePicker: vi.fn((props: { [key: string]: unknown }) => (
        <div data-testid="file-picker" data-props={JSON.stringify(props)} />
      )),
      Separator: vi.fn(() => null),
    },
  );

  const ActionPanel = Object.assign(
    vi.fn(({ children }) => <div>{children}</div>),
    {
      Section: vi.fn(({ children }) => <div>{children}</div>),
    },
  );

  return {
    Form,
    ActionPanel,
    Action: {
      SubmitForm: vi.fn(() => null),
      CreateQuicklink: vi.fn(() => null),
    },
    Icon: {
      Plus: "Icon.Plus",
    },
    showToast: vi.fn(),
    popToRoot: vi.fn(),
    Toast: {
      Style: {
        Animated: "Animated",
        Success: "Success",
        Failure: "Failure",
      },
    },
  };
});

// Mock Raycast Utils
vi.mock("@raycast/utils", () => ({
  useForm: vi.fn(() => ({
    handleSubmit: vi.fn(),
    itemProps: {
      spaceId: { value: "space1", id: "spaceId" },
      typeId: { value: "type1", id: "typeId" },
      templateId: { value: "template1", id: "templateId" },
      listId: { value: "list1", id: "listId" },
      name: { value: "Object Name", id: "name" },
      icon: { value: "emoji", id: "icon" },
      description: { value: "desc", id: "description" },
      body: { value: "body", id: "body" },
      source: { value: "source", id: "source" },
      // Mock property props
      "prop-files": { value: [], id: "prop-files" },
    },
  })),
  showFailureToast: vi.fn(),
}));

// Mock Hooks
vi.mock("../../hooks", () => ({
  useCreateObjectData: vi.fn(() => ({
    spaces: [{ id: "space1", name: "Space 1" }],
    types: [
      {
        id: "type1",
        name: "Type 1",
        key: "type1",
        layout: ObjectLayout.Basic,
        properties: [{ id: "prop1", key: "prop-files", name: "Files", format: PropertyFormat.Files }],
      },
    ],
    templates: [],
    lists: [],
    objects: [],
    selectedSpaceId: "space1",
    setSelectedSpaceId: vi.fn(),
    selectedTypeId: "type1",
    setSelectedTypeId: vi.fn(),
    selectedTemplateId: "",
    setSelectedTemplateId: vi.fn(),
    selectedListId: "",
    setSelectedListId: vi.fn(),
    listSearchText: "",
    setListSearchText: vi.fn(),
    objectSearchText: "",
    setObjectSearchText: vi.fn(),
    isLoadingData: false,
  })),
  useTagsMap: vi.fn(() => ({ tagsMap: {} })),
}));

// Mock Utils
vi.mock("../../utils", () => ({
  bundledPropKeys: {
    description: "description",
    source: "source",
  },
  defaultTintColor: "black",
  fetchTypeKeysForLists: vi.fn(() => Promise.resolve([])),
  getNumberFieldValidations: vi.fn(() => ({})),
  isEmoji: vi.fn(() => true),
}));

describe("CreateObjectForm", () => {
  it("renders FilePicker for PropertyFormat.Files", () => {
    const draftValues = {};
    render(<CreateObjectForm draftValues={draftValues} enableDrafts={false} />);

    // check if FilePicker is rendered
    const filePicker = screen.getByTestId("file-picker");
    expect(filePicker).toBeTruthy();

    // check props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = JSON.parse((filePicker as any).getAttribute("data-props") || "{}");
    expect(props.allowMultipleSelection).toBe(true);
    expect(props.title).toBe("Files");
  });
});
