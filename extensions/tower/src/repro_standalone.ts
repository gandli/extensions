import fs from "fs";
import path from "path";

// Mocks and interfaces

interface ImportedTowerBookmarks {
  children: ImportedTowerBookmark[];
}

interface ImportedTowerBookmark {
  fileURL: string;
  lastOpenedDate: number;
  name: string;
  repositoryIdentifier: string;
  type: number;
  valid: boolean;
  children: ImportedTowerBookmark[];
}

function getCurrentBranchName(gitRepoPath: string): string {
  // Mock implementation or simplified for repro if needed.
  // The original function accesses file system. For repro we can probably skip it or mock it if we don't have real git repos.
  // But let's keep it safe:
  return "main";
}

class Bookmark {
  Folder: string;
  Name: string;
  LastOpenedDate: number;
  RepositoryIdentifier: string;
  Type: number;
  Children: Bookmark[];

  constructor(
    Folder = "",
    Name = "",
    LastOpenedDate = 0,
    RepositoryIdentifier = "",
    Type = 1,
    Children: Bookmark[] = []
  ) {
    this.Name = Name;
    this.LastOpenedDate = LastOpenedDate;
    this.RepositoryIdentifier = RepositoryIdentifier;
    this.Folder = Folder;
    this.Type = Type;
    this.Children = Children;
  }
}

// The function to test (copied from utils.ts before fix)
async function extractBookmarks(obj: ImportedTowerBookmark[], parents?: string): Promise<Bookmark[]> {
  const bookmarks: Bookmark[] = [];

  if (!obj || obj.length === 0) {
    return Promise.resolve(bookmarks);
  }

  obj.forEach(async (bookmark: ImportedTowerBookmark) => {
    // Simulate some async work or scheduling variance
    await new Promise(resolve => setTimeout(resolve, 10));

    const name = parents ? `${parents} / ${bookmark.name}` : bookmark.name;

    if (bookmark.children && bookmark.children.length > 0) {
      const childBookmarks = await extractBookmarks(bookmark.children, name);

      childBookmarks.forEach((bookmark) => bookmarks.push(bookmark));
    }

    bookmarks.push(
      new Bookmark(bookmark.fileURL, name, bookmark.lastOpenedDate, bookmark.repositoryIdentifier, bookmark.type)
    );
  });

  return Promise.resolve(bookmarks);
}

async function extractBookmarksFixed(obj: ImportedTowerBookmark[], parents?: string): Promise<Bookmark[]> {
  if (!obj || obj.length === 0) {
    return [];
  }

  const results = await Promise.all(
    obj.map(async (bookmark) => {
        // Simulate some async work or scheduling variance to match the buggy one
        await new Promise(resolve => setTimeout(resolve, 10));

        const name = parents ? `${parents} / ${bookmark.name}` : bookmark.name;
        const currentBookmarks: Bookmark[] = [];

        if (bookmark.children && bookmark.children.length > 0) {
            const childBookmarks = await extractBookmarksFixed(bookmark.children, name);
            currentBookmarks.push(...childBookmarks);
        }

        currentBookmarks.push(
            new Bookmark(bookmark.fileURL, name, bookmark.lastOpenedDate, bookmark.repositoryIdentifier, bookmark.type)
        );
        return currentBookmarks;
    })
  );

  return results.flat();
}


const mockBookmarks: ImportedTowerBookmark[] = [
  {
    name: "Folder 1",
    children: [
      {
        name: "Repo 1",
        children: [],
        fileURL: "file:///repo1",
        lastOpenedDate: 0,
        repositoryIdentifier: "id1",
        type: 1,
        valid: true
      },
      {
        name: "Subfolder 1",
        children: [
           {
            name: "Repo 2",
            children: [],
            fileURL: "file:///repo2",
            lastOpenedDate: 0,
            repositoryIdentifier: "id2",
            type: 1,
            valid: true
          }
        ],
        fileURL: "",
        lastOpenedDate: 0,
        repositoryIdentifier: "",
        type: 2,
        valid: true
      }
    ],
    fileURL: "",
    lastOpenedDate: 0,
    repositoryIdentifier: "",
    type: 2,
    valid: true
  },
  {
    name: "Repo 3",
    children: [],
    fileURL: "file:///repo3",
    lastOpenedDate: 0,
    repositoryIdentifier: "id3",
    type: 1,
    valid: true
  }
];

async function run() {
  console.log("--- BUGGY VERSION ---");
  const start = process.hrtime();
  const result = await extractBookmarks(mockBookmarks);
  const end = process.hrtime(start);
  const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(3);

  console.log(`Extraction finished in ${timeInMs}ms`);
  console.log(`Found ${result.length} bookmarks.`);

  const names = result.map(b => b.Name);
  console.log("Result names:", names);

  if (result.length !== 5) {
      console.log("FAIL: Expected 5 bookmarks.");
  } else {
      console.log("SUCCESS: Found 5 bookmarks.");
  }

  console.log("\n--- FIXED VERSION ---");
  const startFixed = process.hrtime();
  const resultFixed = await extractBookmarksFixed(mockBookmarks);
  const endFixed = process.hrtime(startFixed);
  const timeInMsFixed = (endFixed[0] * 1000 + endFixed[1] / 1e6).toFixed(3);

  console.log(`Extraction finished in ${timeInMsFixed}ms`);
  console.log(`Found ${resultFixed.length} bookmarks.`);

  const namesFixed = resultFixed.map(b => b.Name);
  console.log("Result names:", namesFixed);

  if (resultFixed.length !== 5) {
      console.error("FAIL: Expected 5 bookmarks.");
      process.exit(1);
  } else {
      console.log("SUCCESS: Found 5 bookmarks.");
  }
}

run();
