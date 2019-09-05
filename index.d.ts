type IFunc = () => any;
type IPromise = () => Promise<any>;
type IPromiseOrFunction = IFunc | IPromise;
// err and actual are produces after calling when/act, etc.
export type IAssert = (assert?: any, err?: Error, actual?: any) => IPromiseOrFunction;
export type ICurriedAssert = (assert?: any) => (err?: Error, actual?: any) => IPromiseOrFunction;

export interface IBehaviors {
  [then: string]: IBehaviors | IAssert;
}

export interface IBDD {
  given?: IPromiseOrFunction;
  when?: IPromiseOrFunction;
  // NOTE: only `given` and `when` can return IPromiseOrFunction
  [then: string]: IBDD | IBehaviors | ICurriedAssert | IPromiseOrFunction;
}

export interface IAAA {
  arrange?: IPromiseOrFunction;
  act?: IPromiseOrFunction;
  // NOTE: only `arrange` and `act` can return IPromiseOrFunction
  [then: string]: IBDD | IBehaviors | ICurriedAssert | IPromiseOrFunction;
}

export interface IVow {
  topic?: IPromiseOrFunction;
  // NOTE: only `topic` can return IPromiseOrFunction
  [then: string]: IBDD | IBehaviors | ICurriedAssert | IPromiseOrFunction;
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

export interface IRunnerConfigInput {
  cwd?: string;
  directories?: string[];
  matchesNamingConvention?: RegExp | ITestString;
  matchesIgnoredConvention?: RegExp | ITestString;
  injectSuite?: boolean;
}

export interface IRunnerConfigOutput extends IRunnerConfigInput {
  cwd: string;
  directories: string[];
  matchesNamingConvention: RegExp | ITestString;
  matchesIgnoredConvention: RegExp | ITestString;
  injectSuite: boolean;
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
  config: IRunnerConfigOutput;
  suite: ISuppose;
  totals: ITally;
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
  reporterFactory: IReporterFactory;
  runner (config?: IRunnerConfigInput): {
    run (): INodeRunnerOutput
  };
}
