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
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import generatePassword, { PasswordOptions, CasingMode, WordListType } from "./generatePassword";
import { getLanguage, t } from "./translations";

interface PasswordArguments {
  wordCount?: string;
  passwordCount?: string;
  separator?: string;
}

interface Preferences {
  defaultWordCount: string;
  defaultPasswordCount: string;
  separator: string;
  casing: CasingMode;
  wordList: WordListType;
  customWordListPath?: string;
  useLeetSpeak: boolean;
  prefix?: string;
  suffix?: string;
  language: string;
}

const MAX_COUNT = 99;

export default function Command(props: LaunchProps<{ arguments: PasswordArguments }>) {
  const preferences = getPreferenceValues<Preferences>();
  const { wordCount, passwordCount, separator } = props.arguments;
  const lang = getLanguage(preferences.language);

  const parseNumber = (value: string | undefined, defaultValue: string) => {
    const val = value || defaultValue;
    const parsedValue = parseInt(val);
    if (isNaN(parsedValue)) return parseInt(defaultValue) || 3;
    if (parsedValue > MAX_COUNT) {
      showToast(Toast.Style.Failure, t("maxCountError", lang));
      return MAX_COUNT;
    }
    if (parsedValue <= 0) return 1;
    return parsedValue;
  };

  const validWordCount = parseNumber(wordCount, preferences.defaultWordCount);
  const validPasswordCount = parseNumber(passwordCount, preferences.defaultPasswordCount);
  const finalSeparator = separator !== undefined ? separator : preferences.separator;

  const options: PasswordOptions = {
    wordCount: validWordCount,
    passwordCount: validPasswordCount,
    separator: finalSeparator,
    casing: preferences.casing,
    wordListType: preferences.wordList,
    customPath: preferences.customWordListPath,
    useLeetSpeak: preferences.useLeetSpeak,
    prefix: preferences.prefix,
    suffix: preferences.suffix,
  };

  const { data, isLoading, revalidate } = useCachedPromise(
    async (opts: PasswordOptions) => {
      return await generatePassword(opts);
    },
    [options],
    {
      initialData: [],
      keepPreviousData: true,
    }
  );

  const getSourceIcon = (type: WordListType) => {
    switch (type) {
      case "nature":
        return Icon.Leaf;
      case "tech":
        return Icon.Code;
      case "poetry":
        return Icon.Quill;
      case "idioms":
        return Icon.Text;
      case "custom":
        return Icon.Folder;
      default:
        return Icon.Key;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 4) return "green";
    if (strength >= 3) return "orange";
    return "red";
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

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      searchBarPlaceholder={t("searchPlaceholder", lang)}
      actions={
        <ActionPanel>
          <Action
            title={t("regenerate", lang)}
            icon={Icon.RotateAntiClockwise}
            onAction={revalidate}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
          <Action title={t("openPreferences", lang)} icon={Icon.Gear} onAction={openCommandPreferences} />
        </ActionPanel>
      }
    >
      <List.Section
        title={t("results", lang)}
        subtitle={
          t("itemsCount", lang, { count: data?.length || 0 }) + ` (${t("source", lang)}: ${preferences.wordList})`
        }
      >
        {data?.map((p, index) => {
          const wordsArr = p.plaintext.split(" ");
          const strengthColor = getStrengthColor(p.strength);

          return (
            <List.Item
              key={index}
              icon={{ source: getSourceIcon(preferences.wordList), tintColor: strengthColor }}
              title={p.password}
              subtitle={getStrengthLabel(p.entropy)}
              keywords={[...wordsArr, p.plaintext]}
              detail={
                <List.Item.Detail
                  markdown={`## ${t("generatedPassword", lang)}\n\`${p.password}\`\n\n---\n### ${t(
                    "components",
                    lang
                  )}\n${wordsArr.map((w) => `\`${w}\``).join("  &bull;  ")}\n\n---\n### ${t(
                    "transformationRules",
                    lang
                  )}\n- **${t("wordList", lang)}**: \`${preferences.wordList}\`\n- **${t("separator", lang)}**: \`${
                    finalSeparator || t("none", lang)
                  }\`\n- **${t("casing", lang)}**: \`${preferences.casing}\`\n- **${t("leetSpeak", lang)}**: \`${
                    preferences.useLeetSpeak ? t("yes", lang) : t("no", lang)
                  }\`\n- **${t("prefixSuffix", lang)}**: \`${preferences.prefix || ""}\` / \`${
                    preferences.suffix || ""
                  }\``}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title={t("wordCount", lang)} text={String(wordsArr.length)} />
                      <List.Item.Detail.Metadata.Label
                        title={t("totalLength", lang)}
                        text={String(p.password.length)}
                      />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label
                        title={t("strengthScore", lang)}
                        text={`${p.strength} / 4`}
                        icon={{
                          source: p.strength >= 3 ? Icon.CheckCircle : Icon.Circle,
                          tintColor: strengthColor,
                        }}
                      />
                      <List.Item.Detail.Metadata.Label
                        title={t("entropy", lang)}
                        text={`${p.entropy} bits`}
                        icon={Icon.Livestream}
                      />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label
                        title={t("sourceList", lang)}
                        text={preferences.wordList}
                        icon={getSourceIcon(preferences.wordList)}
                      />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title={t("copyPassword", lang)}
                    content={p.password}
                    onCopy={() => handleCopy(p.password, "password")}
                  />
                  <Action.CopyToClipboard
                    title={t("copyPlaintext", lang)}
                    content={p.plaintext}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    onCopy={() => handleCopy(p.plaintext, "plaintext")}
                  />
                  <Action
                    title={t("regenerate", lang)}
                    icon={Icon.RotateAntiClockwise}
                    onAction={revalidate}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                  <Action
                    title={t("openPreferences", lang)}
                    icon={Icon.Gear}
                    onAction={openCommandPreferences}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
