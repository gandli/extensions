import { useState } from "react";
import {
  LaunchProps,
  Icon,
  List,
  Clipboard,
  Action,
  ActionPanel,
  showToast,
  Toast,
  getPreferenceValues,
  openCommandPreferences,
  Color,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import generatePassword, { PasswordOptions, CasingMode, WordListType } from "./generatePassword";
import { getLanguage, t } from "./translations";

interface PasswordArguments {
  wordCount?: string;
  passwordCount?: string;
  separator?: string;
}

export default function Command(props: LaunchProps<{ arguments: PasswordArguments }>) {
  const preferences = getPreferenceValues<{
    defaultWordCount: string;
    defaultPasswordCount: string;
    separator: string;
    casing: CasingMode;
    wordList: WordListType;
    customWordListPath?: string;
    useLeetSpeak: boolean;
    language: string;
    prefix?: string;
    suffix?: string;
  }>();

  const [selectedWordList, setSelectedWordList] = useState<WordListType>(preferences.wordList);

  const lang = getLanguage(preferences.language);

  const parseNumber = (val: string | undefined, defaultVal: string): number => {
    const num = parseInt(val || defaultVal, 10);
    return isNaN(num) ? parseInt(defaultVal, 10) : num;
  };

  const validWordCount = parseNumber(props.arguments.wordCount, preferences.defaultWordCount);
  const validPasswordCount = parseNumber(props.arguments.passwordCount, preferences.defaultPasswordCount);
  const finalSeparator = props.arguments.separator !== undefined ? props.arguments.separator : preferences.separator;

  const options: PasswordOptions = {
    wordCount: validWordCount,
    passwordCount: validPasswordCount,
    separator: finalSeparator,
    casing: preferences.casing,
    wordListType: selectedWordList,
    customPath: preferences.customWordListPath,
    useLeetSpeak: preferences.useLeetSpeak,
    prefix: preferences.prefix,
    suffix: preferences.suffix,
  };

  const { data, isLoading, revalidate } = useCachedPromise(
    async (opts: PasswordOptions) => {
      if (opts.passwordCount > 99) {
        throw new Error(t("maxCountError", lang));
      }
      return await generatePassword(opts);
    },
    [options],
    {
      initialData: [],
      keepPreviousData: true,
      onError: (error) => {
        showToast(Toast.Style.Failure, error instanceof Error ? error.message : String(error));
      },
    }
  );

  const getSourceIcon = (type: WordListType) => {
    switch (type) {
      case "oxford":
        return Icon.Book;
      case "idioms":
        return Icon.QuoteBlock;
      case "poetry":
        return Icon.Brush;
      case "tech":
        return Icon.Terminal;
      case "nature":
        return Icon.Leaf;
      case "custom":
        return Icon.Folder;
      default:
        return Icon.Key;
    }
  };

  const getStrengthColor = (strength: number): Color => {
    if (strength >= 4) return Color.Green;
    if (strength >= 3) return Color.Orange;
    return Color.Red;
  };

  const getStrengthLabel = (entropy: number): string => {
    if (entropy >= 60) return t("strengthVeryStrong", lang);
    if (entropy >= 40) return t("strengthStrong", lang);
    if (entropy >= 25) return t("strengthModerate", lang);
    return t("strengthWeak", lang);
  };

  const handleCopy = async (content: string, type: "password" | "plaintext") => {
    await Clipboard.copy(content);
    await showToast(Toast.Style.Success, t(type === "password" ? "passwordCopied" : "plaintextCopied", lang));
  };

  const wordLists: { title: string; value: WordListType }[] = [
    { title: t("oxford", lang), value: "oxford" },
    { title: t("idioms", lang), value: "idioms" },
    { title: t("poetry", lang), value: "poetry" },
    { title: t("tech", lang), value: "tech" },
    { title: t("nature", lang), value: "nature" },
    { title: t("custom", lang), value: "custom" },
  ];

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      searchBarPlaceholder={t("searchPlaceholder", lang)}
      searchBarAccessory={
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          <List.Dropdown
            tooltip={t("wordListDropdownTitle", lang)}
            value={selectedWordList}
            onChange={(newValue) => setSelectedWordList(newValue as WordListType)}
          >
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (wordLists.map((item) => (
                <List.Dropdown.Item
                  key={item.value}
                  title={item.title}
                  value={item.value}
                  icon={getSourceIcon(item.value)}
                />
              )) as any)
            }
          </List.Dropdown>
        ) as any
      }
    >
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          <List.Section title={t("results", lang)} subtitle={t("itemsCount", lang, { count: data?.length || 0 })}>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (data?.map((p, index) => {
                const wordsArr = p.plaintext.split(" ");
                const strengthColor = getStrengthColor(p.strength);
                const strengthText = getStrengthLabel(p.entropy);

                return (
                  <List.Item
                    key={index}
                    icon={{ source: getSourceIcon(selectedWordList), tintColor: strengthColor }}
                    title={p.password}
                    accessories={[
                      {
                        text: { value: `${Math.round(p.entropy)} bits`, color: strengthColor },
                        icon: { source: p.strength >= 3 ? Icon.CheckCircle : Icon.Circle, tintColor: strengthColor },
                        tooltip: strengthText,
                      },
                    ]}
                    keywords={[...wordsArr, p.plaintext]}
                    detail={
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (
                        <List.Item.Detail
                          markdown={`### ${t("componentsLabel", lang)}\n${wordsArr
                            .map((w: string) => `\`${w}\``)
                            .join("  &bull;  ")}`}
                          metadata={
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (
                              <List.Item.Detail.Metadata>
                                <List.Item.Detail.Metadata.TagList title={t("strengthLabel", lang)} children={(<List.Item.Detail.Metadata.TagList.Item text={strengthText} color={strengthColor} />) as any} />
                                <List.Item.Detail.Metadata.Separator />
                                <List.Item.Detail.Metadata.Label
                                  title={t("wordCount", lang)}
                                  text={String(wordsArr.length)}
                                  icon={Icon.Text}
                                />
                                <List.Item.Detail.Metadata.Label
                                  title={t("totalLength", lang)}
                                  text={String(p.password.length)}
                                  icon={Icon.Hashtag}
                                />
                                <List.Item.Detail.Metadata.Label
                                  title={t("entropy", lang)}
                                  text={`${Math.round(p.entropy)} bits`}
                                  icon={Icon.Livestream}
                                />
                              </List.Item.Detail.Metadata>
                            ) as any
                          }
                        />
                      ) as any
                    }
                    actions={
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (
                        <ActionPanel>
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (
                              <ActionPanel.Section title={t("copyActions", lang)}>
                                {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (
                                    <Action.CopyToClipboard
                                      title={t("copyPassword", lang)}
                                      content={p.password}
                                      onCopy={() => {
                                        handleCopy(p.password, "password");
                                      }}
                                    />
                                  ) as any
                                }
                                {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (
                                    <Action.CopyToClipboard
                                      title={t("copyPlaintext", lang)}
                                      content={p.plaintext}
                                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                                      onCopy={() => {
                                        handleCopy(p.plaintext, "plaintext");
                                      }}
                                    />
                                  ) as any
                                }
                              </ActionPanel.Section>
                            ) as any
                          }
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (
                              <ActionPanel.Section title={t("generationActions", lang)}>
                                {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (
                                    <Action
                                      title={t("regenerate", lang)}
                                      icon={Icon.RotateAntiClockwise}
                                      onAction={revalidate}
                                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                                    />
                                  ) as any
                                }
                              </ActionPanel.Section>
                            ) as any
                          }
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (
                              <ActionPanel.Section title={t("systemActions", lang)}>
                                {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (
                                    <Action
                                      title={t("openPreferences", lang)}
                                      icon={Icon.Gear}
                                      onAction={openCommandPreferences}
                                      shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
                                    />
                                  ) as any
                                }
                              </ActionPanel.Section>
                            ) as any
                          }
                        </ActionPanel>
                      ) as any
                    }
                  />
                );
              }) as any)
            }
          </List.Section>
        ) as any
      }
    </List>
  );
}
