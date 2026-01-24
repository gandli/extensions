import { ActionPanel, List, Icon, Action, closeMainWindow, getPreferenceValues } from "@raycast/api";
import { useState, useEffect } from "react";

import { getFirefoxProfiles } from "./lib/firefox";
import { getChromiumProfiles } from "./lib/chromium";
import { launchBrowser } from "./lib/browsers";
import { BrowserProfiles } from "./lib/types";

export default function Command() {
  const [browsers, setBrowsers] = useState<BrowserProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const preferences = getPreferenceValues();
      const enabledBrowsers = preferences["browsers.filter"].split(",");

      const chromiumProfiles = await getChromiumProfiles(enabledBrowsers);
      const firefoxProfiles = getFirefoxProfiles(enabledBrowsers);

      const allBrowsers = [...chromiumProfiles, ...firefoxProfiles];
      setBrowsers(allBrowsers);
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  return (
    <List isLoading={loading}>
      {browsers.map((browser, index) => (
        <List.Section key={`browser-section-${index}`} title={browser.name}>
          {browser.profiles.map((profile, pindex) => (
            <List.Item
              key={`browser-profile-${pindex}`}
              icon={{ source: `icons/${profile.icon}` }}
              title={profile.label}
              accessories={[{ text: "Launch this profile", icon: Icon.Globe }]}
              actions={
                <ActionPanel>
                  <Action
                    title="Open Browser"
                    onAction={async () => {
                      launchBrowser(profile.type, profile.app, profile.path);
                      await closeMainWindow({ clearRootSearch: true });
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
