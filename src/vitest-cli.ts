// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Vitest } from 'vitest';
import { createVitest } from 'vitest/node';

const minimist = require('minimist');

// https://jestjs.io/docs/en/cli#options
export class VitestCLI {
  public static argvToOptions(): object {
    const argv = process.argv.slice(2);

    return minimist(argv);
  };

  public static async runTests(testFilePaths: string[]): Promise<void> {
    const vitestCLI: Vitest = await createVitest('test', {
      run: true,
      watch: false,
      converage: {
        enabled: true,
      },
    });
    const results = await vitestCLI.run(testFilePaths);
  }

}
