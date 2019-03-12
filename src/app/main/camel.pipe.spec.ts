import { CamelPipe } from './camel.pipe';

describe('CamelPipe', () => {
  it('create an instance', () => {
    const pipe = new CamelPipe();
    expect(pipe).toBeTruthy();
  });
});
