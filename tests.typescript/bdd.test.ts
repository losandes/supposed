import * as Chai from 'chai';
import { ISuppose } from '..';

export = async function test (test: ISuppose): Promise<void> {
  await test('TypeScript: when a BDD style test is executed, it should execute the test', {
    given: () => 42,
    when: (num: number) => num / 0,
    'it should execute the test': (expect: Chai.ExpectStatic) => (err: Error, actual: number): void => {
      expect(err).to.equal(null)
      expect(actual).to.equal(Infinity)
    }
  })

  await test('TypeScript: when a BDD style test is executed with a single assertion function, it should execute the test', {
    given: () => 42,
    when: (num: number) => num / 0,
    'it should execute the test': (expect?: any, err?: Error, actual?: any): void => {
      expect(err).to.equal(null)
      expect(actual).to.equal(Infinity)
    }
  })
}
