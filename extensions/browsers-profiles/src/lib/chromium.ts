import { promises as fsPromises, Dirent } from "fs";
import os from "os";

import browsers from "./supported-browsers.json";
import { sortProfiles, isBrowserEnabled } from "./utils";
import { BrowserProfile, BrowserProfiles } from "./types";

export const getChromiumProfiles = async (filter: string[]): Promise<BrowserProfiles[]> => {
  const browserPromises = browsers.chromium.map(async (browser) => {
    if (!isBrowserEnabled(filter, browser)) {
      return null;
    }

    const path = `${os.homedir()}${browser.path}`;

    try {
      await fsPromises.access(path);
    } catch {
      return null;
    }

    const localStatePath = `${path}/Local State`;

    let localState;
    try {
      const localStateFile = await fsPromises.readFile(localStatePath, "utf-8");
      localState = JSON.parse(localStateFile);
    } catch (error) {
      return null;
    }

    const infoCacheData = localState?.profile?.info_cache as
      | Record<
          string,
          {
            name: string;
          }
        >
      | undefined;

    if (!infoCacheData) {
      return null;
    }

    let directories: Dirent[] = [];
    try {
      directories = await fsPromises.readdir(path, { withFileTypes: true });
    } catch {
      return null;
    }

    const browserProfiles: BrowserProfile[] = [];

    const profilePromises = directories.map(async (dirent) => {
      if (!dirent.isDirectory()) {
        return;
      }
      const directory = dirent.name;

      const preferences = `${path}/${directory}/Preferences`;
      try {
        const file = await fsPromises.readFile(preferences, "utf-8");
        const profile = JSON.parse(file);
        const profileName = profile.profile.name;
        const profileLabel = infoCacheData[directory]?.name || profileName;

        browserProfiles.push({
          type: browser.type,
          browser: browser.title,
          app: browser.app,
          path: directory,
          name: profileName,
          uid: directory,
          label: profileLabel,
          icon: browser.icon,
        });
      } catch (error) {
        // Ignore files that are not profiles or cannot be read
      }
    });

    await Promise.all(profilePromises);

    sortProfiles(browserProfiles);

    return {
      name: browser.title,
      profiles: browserProfiles,
    };
  });

  const results = await Promise.all(browserPromises);

  // Filter out null results (disabled browsers or errors)
  return results.filter((p): p is BrowserProfiles => p !== null);
};
