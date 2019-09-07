// Type definitions for @polyn/supposed
// Project: https://github.com/losandes/polyn-supposed
// Definitions by: Andy Wright <https://github.com/losandes>
// TypeScript Version: 2.1

import * as http from 'http'

type IFunc = () => any;
type IPromise = () => Promise<any>;
type IPromiseOrFunction = IFunc | IPromise;
// err and actual are produces after calling when/act, etc.
export type IAssert = (assert?: any, err?: Error, actual?: any) => any | Promise<any>;
export type ICurriedAssert = (assert?: any) => (err?: Error, actual?: any) => any | Promise<any>;

export interface IBehaviors {
  [then: string]: IBehaviors | IAssert;
}

export interface IBDD {
  given?: IPromiseOrFunction | undefined;
  when?: IPromiseOrFunction | undefined;
  // NOTE: only `given` and `when` can return `IPromiseOrFunction | undefined`
  [then: string]: IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction | undefined;
}

export interface IAAA {
  arrange?: IPromiseOrFunction | undefined;
  act?: IPromiseOrFunction | undefined;
  // NOTE: only `arrange` and `act` can return `IPromiseOrFunction | undefined`
  [assert: string]: IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction | undefined;
}

export interface IVow {
  topic?: IPromiseOrFunction | undefined;
  // NOTE: only `topic` can return `IPromiseOrFunction | undefined`
  [assert: string]: IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction | undefined;
}

interface ITally {
  total: number;
  passed: number;
  skipped: number;
  failed: number;
  broken: number;
  startTime: number;
  endTime: number;
}

// different events have different properties - this has all-possibilities (nullable)
export interface ITestEvent {
  type: string;
  status?: string;
  time?: number;
  behavior?: string;
  error?: Error;
  suiteId?: string;
  batchId?: string;
  plan?: {
    count: number;
    completed: number;
  };
  log?: any;
  totals?: ITally;
}

interface IWrite {
  (event: ITestEvent): Promise<void>
}

interface IReport {
  write: IWrite;
}

/**
 * Reporters are factories that export a `write` function, similar to WritableStreams
 *
 * NOTE the required name. This is so each reporter can be registered only once
 * when subscribing to events. `name` is a protected property on functions and classes,
 * so this can be accomplished with a class or a named function.
 *
 * i.e.
 *   ```
 *   class MyReporter {
 *     write (event: ITestEvent): Promise<void> { ... }
 *   }
 *   ```
 *
 *   ```
 *   function MyReporter () {
 *     const write = (event: ITestEvent): Promise<void> => { ... }
 *     return { write }
 *   }
 *   ```
 */
export interface IReporter {
  (): IReport;
  name: string;
}

export interface IReporterFactory {
  get (name: string): IReporter;
  add (reporter: IReporter): IReporterFactory;
}

export interface ISuiteConfig {
  name?: string;
  assertionLibrary?: any; // assert, chai.expect, etc.
  match?: string | RegExp;
  timeout?: number;
  reporter?: string | IWrite | IReport;
  reporters?: string[];
}

interface ITestString {
  test (filePath: string): boolean;
}

export interface INodeRunnerConfigInput {
  cwd?: string;
  directories?: string[];
  matchesNamingConvention?: RegExp | ITestString;
  matchesIgnoredConvention?: RegExp | ITestString;
  injectSuite?: boolean;
  tests?: (Function | Object)[]
}

export interface INodeRunnerConfigOutput {
  cwd: string;
  directories: string[];
  matchesNamingConvention: RegExp | ITestString;
  matchesIgnoredConvention: RegExp | ITestString;
  injectSuite: boolean;
}

export interface IBrowserRunnerConfigInput extends INodeRunnerConfigInput {
  title?: string;
  port?: number;
  dependencies?: string[];
  scripts?: string[];
  styles?: string;
  supposed?: string;
  template?: string;
  page?: string;
  testBundle?: string;
  stringifiedSuiteConfig?: string;
}

export interface IBrowserRunnerConfigOutput {
  cwd: string;
  title: string;
  port: number;
  dependencies: string[];
  scripts: string[];
  styles: string;
  supposed: string;
  template: string;
  page: string;
  testBundle: string;
  stringifiedSuiteConfig: string;
}

export interface ICompletedBatch {
  batchId: string;
  results: ITestEvent[];
  totals: ITally;
}

export interface INodeRunnerOutput {
  files: string[];
  results: ICompletedBatch[];
  broken: Error[];
  config: INodeRunnerConfigOutput;
  suite: ISuppose;
  totals: ITally;
}

export interface IBrowserRunnerOutput {
  server: http.Server;
  paths: string[];
  config: IBrowserRunnerConfigOutput;
}

export interface ISuppose {
  (
    description: string,
    assertions: IAssert | IBehaviors | IBDD | IAAA | IVow
  ): Promise<ICompletedBatch>;
  (
    assertions: IAssert | IBehaviors | IBDD | IAAA | IVow
  ): Promise<ICompletedBatch>;

  Suite (config?: ISuiteConfig): ISuppose;
  subscribe (subscription: IWrite | IReport): void;
  reporters: IReporter[];
  reporterFactory: IReporterFactory;
  runner (config?: INodeRunnerConfigInput | IBrowserRunnerConfigInput): {
    // find files, load them, and run the tests
    run (): Promise<INodeRunnerOutput>;
    // run the tests (expects tests to be presented in the INodeRunnerConfigInput)
    runTests (): Promise<INodeRunnerOutput>;
    // find files, load them, and serve them from an HTTP server
    startServer (): Promise<IBrowserRunnerOutput>;
  };
}

export default ISuppose;
export function Suite (config?: ISuiteConfig): ISuppose;
export function subscribe (subscription: IWrite | IReport): void;
export const reporters: IReporter[];
export const reporterFactory: IReporterFactory;
export function runner (config?: INodeRunnerConfigInput | IBrowserRunnerConfigInput): {
  // find files, load them, and run the tests
  run (): Promise<INodeRunnerOutput>;
  // run the tests (expects tests to be presented in the INodeRunnerConfigInput)
  runTests (): Promise<INodeRunnerOutput>;
  // find files, load them, and serve them from an HTTP server
  startServer (): Promise<IBrowserRunnerOutput>;
};
