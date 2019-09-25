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

interface IDuration {
  seconds: number;
  milliseconds: number;
  microseconds: number;
  nanoseconds: number;
}

interface ISimpleTally {
  total: number;
  passed: number;
  skipped: number;
  failed: number;
  broken: number;
  startTime: number;
  endTime: number;
  duration: IDuration;
}

interface IFinalTally extends ISimpleTally {
  results: ISupposedEvent[];
  batches: { [batchId: string]: ISimpleTally };
}

// different events have different properties - this has all-possibilities (nullable)
export interface ISupposedEvent {
  suiteId?: string;
  batchId?: string;
  testId?: string;
  count?: number;
  time?: number;
  type: string;
  status?: string;  // only when type === 'TEST'
  behavior?: string;    // behaviors joined to a string with comma's
  behaviors?: string[]; // the test descriptions nests as an array
  plan?: {
    count: number;
    completed: number;
  };
  error?: Error;
  log?: any;      // only when type === 'TEST'
  context?: any;  // only when type === 'TEST'
  duration?: {
    given: IDuration;
    when: IDuration;
    then: IDuration;
    total: IDuration;
  };
  tally?: IFinalTally;
  totals?: ISimpleTally;
}

export interface IStartEvent {
  type: 'START';
  suiteId: string;
  time: number;
}

export interface IEndEvent {
  type: 'START';
  suiteId: string;
  time: number;
  totals: ISimpleTally;
}

export interface ITestEvent {
  suiteId: string;
  batchId: string;
  testId: string;
  count: number;
  time: number;
  type: 'TEST';
  status: 'PASSED' | 'SKIPPED' | 'FAILED' | 'BROKEN';
  behavior: string;
  behaviors: string[];
}

export interface ITestPassedEvent extends ITestEvent {
  status: 'PASSED';
  log?: any;
  context?: any;
  duration: {
    given: IDuration;
    when: IDuration;
    then: IDuration;
    total: IDuration;
  };
}

export interface ITestFailedEvent extends ITestEvent {
  status: 'FAILED' | 'BROKEN';
  error: Error;
}

interface IWrite {
  (event: ISupposedEvent): Promise<void>
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
 *     write (event: ISupposedEvent): Promise<void> { ... }
 *   }
 *   ```
 *
 *   ```
 *   function MyReporter () {
 *     const write = (event: ISupposedEvent): Promise<void> => { ... }
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

export interface ITestRunnerConfigInput {
  tests: IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction;
  config?: {
    injectSuite?: boolean;
  };
  paths?: string[];
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
  results: ISupposedEvent[];
  totals: ISimpleTally;
}

export interface INodeRunnerOutput {
  files: string[];
  results: ICompletedBatch[];
  broken: Error[];
  config: INodeRunnerConfigOutput;
  suite: ISuppose;
  totals: ISimpleTally;
}

export interface IBrowserRunnerOutput {
  server: http.Server;
  paths: string[];
  config: IBrowserRunnerConfigOutput;
}

interface ISuites {
  [name: string]: ISuppose
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
  suites: ISuites;
  configure (config?: ISuiteConfig): ISuppose;
  config: ISuiteConfig;
  subscribe (subscription: IWrite | IReport): void;
  reporters: IReporter[];
  reporterFactory: IReporterFactory;
  runner (config?: INodeRunnerConfigInput | IBrowserRunnerConfigInput | ITestRunnerConfigInput): {
    // find files, load them, and run the tests
    run (): Promise<INodeRunnerOutput>;
    // run the tests (expects tests to be presented in the INodeRunnerConfigInput)
    runTests (tests?: [() => IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction]): Promise<INodeRunnerOutput>;
    // find files, load them, and serve them from an HTTP server
    startServer (): Promise<IBrowserRunnerOutput>;
  };
}

export default ISuppose;
export function Suite (config?: ISuiteConfig): ISuppose;
export const suites: ISuites;
export function configure (config?: ISuiteConfig): ISuppose;
export const config: ISuiteConfig;
export function subscribe (subscription: IWrite | IReport): void;
export const reporters: IReporter[];
export const reporterFactory: IReporterFactory;
export function runner (config?: INodeRunnerConfigInput | IBrowserRunnerConfigInput): {
  // find files, load them, and run the tests
  run (): Promise<INodeRunnerOutput>;
  // run the tests (expects tests to be presented in the INodeRunnerConfigInput)
  runTests (tests?: [() => IBDD | IBehaviors | IAssert | ICurriedAssert | IPromiseOrFunction]): Promise<INodeRunnerOutput>;
  // find files, load them, and serve them from an HTTP server
  startServer (): Promise<IBrowserRunnerOutput>;
};
