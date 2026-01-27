import { extractBookmarks } from "./utils";
import { ImportedTowerBookmark } from "./interfaces/imported-tower-bookmark";

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
  console.log("Starting extraction...");
  const start = process.hrtime();
  const result = await extractBookmarks(mockBookmarks);
  const end = process.hrtime(start);
  const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(3);

  console.log(`Extraction finished in ${timeInMs}ms`);
  console.log(`Found ${result.length} bookmarks.`);

  const names = result.map(b => b.Name);
  console.log("Result names:", names);

  // Total expected: 5 items (Folder 1, Repo 1, Subfolder 1, Repo 2, Repo 3)
  if (result.length !== 5) {
      console.error("FAIL: Expected 5 bookmarks.");
      process.exit(1);
  } else {
      console.log("SUCCESS: Found 5 bookmarks.");
  }
}

run();
