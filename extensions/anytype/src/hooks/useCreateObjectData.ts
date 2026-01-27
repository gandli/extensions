import { showFailureToast, useCachedPromise, useLocalStorage } from "@raycast/utils";
import { useEffect, useMemo, useState } from "react";
import { CreateObjectFormValues } from "../components";
import { bundledTypeKeys, fetchAllTemplatesForSpace, fetchAllTypesForSpace, memberMatchesSearch } from "../utils";
import { useMembers } from "./useMembers";
import { useSearch } from "./useSearch";
import { useSpaces } from "./useSpaces";

export function useCreateObjectData(initialValues?: CreateObjectFormValues) {
  const { value: storedSpaceId, setValue: setStoredSpaceId, isLoading: isLoadingStoredSpaceId } =
    useLocalStorage<string>("create-object-space-id", "");
  const [selectedSpaceId, setSelectedSpaceId] = useState(initialValues?.spaceId || "");
  const [hasLoadedSpace, setHasLoadedSpace] = useState(false);

  useEffect(() => {
    if (!isLoadingStoredSpaceId && !hasLoadedSpace) {
      if (!initialValues?.spaceId && storedSpaceId && !selectedSpaceId) {
        setSelectedSpaceId(storedSpaceId);
      }
      setHasLoadedSpace(true);
    }
  }, [isLoadingStoredSpaceId, hasLoadedSpace, initialValues?.spaceId, storedSpaceId, selectedSpaceId]);

  useEffect(() => {
    if (hasLoadedSpace) {
      setStoredSpaceId(selectedSpaceId);
    }
  }, [hasLoadedSpace, selectedSpaceId, setStoredSpaceId]);

  const { value: storedTypeId, setValue: setStoredTypeId, isLoading: isLoadingStoredTypeId } = useLocalStorage<string>(
    "create-object-type-id",
    "",
  );
  const [selectedTypeId, setSelectedTypeId] = useState(initialValues?.typeId || "");
  const [hasLoadedType, setHasLoadedType] = useState(false);

  useEffect(() => {
    if (!isLoadingStoredTypeId && !hasLoadedType) {
      if (!initialValues?.typeId && storedTypeId && !selectedTypeId) {
        setSelectedTypeId(storedTypeId);
      }
      setHasLoadedType(true);
    }
  }, [isLoadingStoredTypeId, hasLoadedType, initialValues?.typeId, storedTypeId, selectedTypeId]);

  useEffect(() => {
    if (hasLoadedType) {
      setStoredTypeId(selectedTypeId);
    }
  }, [hasLoadedType, selectedTypeId, setStoredTypeId]);

  const { value: storedTemplateId, setValue: setStoredTemplateId, isLoading: isLoadingStoredTemplateId } =
    useLocalStorage<string>("create-object-template-id", "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialValues?.templateId || "");
  const [hasLoadedTemplate, setHasLoadedTemplate] = useState(false);

  useEffect(() => {
    if (!isLoadingStoredTemplateId && !hasLoadedTemplate) {
      if (!initialValues?.templateId && storedTemplateId && !selectedTemplateId) {
        setSelectedTemplateId(storedTemplateId);
      }
      setHasLoadedTemplate(true);
    }
  }, [
    isLoadingStoredTemplateId,
    hasLoadedTemplate,
    initialValues?.templateId,
    storedTemplateId,
    selectedTemplateId,
  ]);

  useEffect(() => {
    if (hasLoadedTemplate) {
      setStoredTemplateId(selectedTemplateId);
    }
  }, [hasLoadedTemplate, selectedTemplateId, setStoredTemplateId]);

  const { value: storedListId, setValue: setStoredListId, isLoading: isLoadingStoredListId } = useLocalStorage<string>(
    "create-object-list-id",
    "",
  );
  const [selectedListId, setSelectedListId] = useState(initialValues?.listId || "");
  const [hasLoadedList, setHasLoadedList] = useState(false);

  useEffect(() => {
    if (!isLoadingStoredListId && !hasLoadedList) {
      if (!initialValues?.listId && storedListId && !selectedListId) {
        setSelectedListId(storedListId);
      }
      setHasLoadedList(true);
    }
  }, [isLoadingStoredListId, hasLoadedList, initialValues?.listId, storedListId, selectedListId]);

  useEffect(() => {
    if (hasLoadedList) {
      setStoredListId(selectedListId);
    }
  }, [hasLoadedList, selectedListId, setStoredListId]);

  const [listSearchText, setListSearchText] = useState("");
  const [objectSearchText, setObjectSearchText] = useState("");

  const { spaces, spacesError, isLoadingSpaces } = useSpaces();
  const {
    objects: lists,
    objectsError: listsError,
    isLoadingObjects: isLoadingLists,
  } = useSearch(selectedSpaceId, listSearchText, [bundledTypeKeys.collection]);

  const restrictedTypes = [
    bundledTypeKeys.audio,
    bundledTypeKeys.chat,
    bundledTypeKeys.file,
    bundledTypeKeys.image,
    bundledTypeKeys.object_type,
    bundledTypeKeys.tag,
    bundledTypeKeys.template,
    bundledTypeKeys.video,
    bundledTypeKeys.participant,
  ];

  const {
    data: allTypes,
    error: typesError,
    isLoading: isLoadingTypes,
  } = useCachedPromise(fetchAllTypesForSpace, [selectedSpaceId], { execute: !!selectedSpaceId });

  const types = useMemo(() => {
    if (!allTypes) return [];
    return allTypes.filter((type) => !restrictedTypes.includes(type.key));
  }, [allTypes, restrictedTypes]);

  const {
    data: templates,
    error: templatesError,
    isLoading: isLoadingTemplates,
  } = useCachedPromise(fetchAllTemplatesForSpace, [selectedSpaceId, selectedTypeId], {
    execute: !!selectedSpaceId && !!selectedTypeId,
    initialData: [],
  });

  const { objects, objectsError, isLoadingObjects } = useSearch(selectedSpaceId, objectSearchText, []);
  const { members, membersError, isLoadingMembers } = useMembers(selectedSpaceId, objectSearchText);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => memberMatchesSearch(member, objectSearchText));
  }, [members, objectSearchText]);

  const combinedObjects = useMemo(() => {
    return [...(objects || []), ...filteredMembers];
  }, [objects, filteredMembers]);

  useEffect(() => {
    if (spacesError || typesError || templatesError || listsError || objectsError || membersError) {
      showFailureToast(spacesError || typesError || templatesError || listsError || objectsError || membersError, {
        title: "Failed to fetch latest data",
      });
    }
  }, [spacesError, typesError, templatesError, listsError, objectsError, membersError]);

  const isLoadingData =
    isLoadingSpaces ||
    isLoadingTypes ||
    isLoadingTemplates ||
    isLoadingLists ||
    isLoadingObjects ||
    isLoadingMembers ||
    isLoadingStoredSpaceId ||
    isLoadingStoredTypeId ||
    isLoadingStoredTemplateId ||
    isLoadingStoredListId;

  return {
    spaces,
    types,
    templates,
    lists,
    objects: combinedObjects,
    selectedSpaceId,
    setSelectedSpaceId,
    selectedTypeId,
    setSelectedTypeId,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedListId,
    setSelectedListId,
    listSearchText,
    setListSearchText,
    objectSearchText,
    setObjectSearchText,
    isLoadingData,
  };
}
