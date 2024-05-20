#!/usr/bin/env node

import {
  KnapsackProCore,
  KnapsackProLogger,
  testFilesToExecuteType,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';
import { EnvConfig } from './env-config';
import { TestFilesFinder } from './test-files-finder';
import { VitestCLI } from './vitest-cli';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const vitest = require('vitest');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name: clientName, version: clientVersion } = require('../package.json');

const vitestCLIOptions = VitestCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();
knapsackProLogger.debug(
  `Vitest CLI options:\n${KnapsackProLogger.objectInspect(vitestCLIOptions)}`,
);

EnvConfig.loadEnvironmentVariables();

const projectPath = process.cwd();
const testFilesToExecute: testFilesToExecuteType = () =>
  TestFilesFinder.allTestFiles();
const knapsackPro = new KnapsackProCore(
  clientName,
  clientVersion,
  testFilesToExecute,
);

const onSuccess: onQueueSuccessType = async (queueTestFiles: TestFile[]) => {
  const testFilePaths: string[] = queueTestFiles.map(
    (testFile: TestFile) => testFile.path,
  );

  const vitestCLICoverage = EnvConfig.coverageDirectory
    ? { coverageDirectory: `${EnvConfig.coverageDirectory}/${uuidv4()}` }
    : {};

  const {
    results: { success: isTestSuiteGreen, testResults },
  } = await vitest.runCLI(
    {
      ...vitestCLIOptions,
      ...vitestCLICoverage,
      runTestsByPath: true,
      _: testFilePaths,
    },
    [projectPath],
  );

  const recordedTestFiles: TestFile[] = testResults.map(
    ({
      testFilePath,
      perfStats: { start, end },
    }: {
      testFilePath: string;
      perfStats: { start: number; end: number };
    }) => {
      const path =
        process.platform === 'win32'
          ? testFilePath.replace(`${projectPath}\\`, '').replace(/\\/g, '/')
          : testFilePath.replace(`${projectPath}/`, '');
      const timeExecutionMiliseconds = end - start;
      const timeExecution =
        timeExecutionMiliseconds > 0 ? timeExecutionMiliseconds / 1000 : 0.0;

      return {
        path,
        time_execution: timeExecution,
      };
    },
  );

  return {
    recordedTestFiles,
    isTestSuiteGreen,
  };
};

// we do nothing when error so pass noop
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
const onError: onQueueFailureType = (error: any) => {};

knapsackPro.runQueueMode(onSuccess, onError);
