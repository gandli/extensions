import { Action, ActionPanel, Detail, useNavigation } from "@raycast/api";
import { createContext, useContext } from "react";
import { Generation } from "../types";
import { useGenerationContext } from "./GenerationContext";

export interface GenerationContextType {
  selectedId: string;
}

const SelectedContext = createContext({} as { selectedGeneration: Generation });

export function useSelectedGenerationContext() {
  return useContext(SelectedContext);
}

export function SelectedGenerationContextProvider({
  children,
  selectedId,
}: GenerationContextType & { children: React.ReactNode }) {
  const { generations } = useGenerationContext();
  const selectedGeneration = generations.find((gen) => gen.guid === selectedId);
  const { pop } = useNavigation();

  if (!selectedGeneration) {
    return (
      <Detail
        markdown="## Generation not found"
        actions={
          <ActionPanel>
            <Action title="Go Back" onAction={pop} />
          </ActionPanel>
        }
      />
    );
  }
  return (
    <SelectedContext.Provider
      value={{
        selectedGeneration,
      }}
    >
      {children}
    </SelectedContext.Provider>
  );
}
