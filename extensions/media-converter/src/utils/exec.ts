import util from "util";
import { exec, spawn } from "child_process";

export const execPromise = util.promisify(exec);

export function spawnPromise(
  command: string,
  callbacks?: {
    onStdout?: (data: string) => void;
    onStderr?: (data: string) => void;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    // We use shell: true to support command strings with arguments
    const child = spawn(command, { shell: true });

    if (callbacks?.onStdout) {
      child.stdout.on("data", (data) => callbacks.onStdout!(data.toString()));
    }

    if (callbacks?.onStderr) {
      child.stderr.on("data", (data) => callbacks.onStderr!(data.toString()));
    }

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
