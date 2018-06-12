import yoda from '../../src/yoda.js';

describe('yoda', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(yoda, 'greet');
      yoda.greet();
    });

    it('should have been run once', () => {
      expect(yoda.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(yoda.greet).to.have.always.returned('hello');
    });
  });
});
