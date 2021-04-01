import { ISuppose } from 'supposed';

export = async function (test: ISuppose): Promise<void> {
  await test(
    'TypeScript: when a xunit style test is executed, it should execute the test',
    (expect: Chai.ExpectStatic): void => {
      expect(1).to.equal(1)
      return
    })
}
