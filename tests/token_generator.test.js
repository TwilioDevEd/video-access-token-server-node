const jwt = require('jsonwebtoken');
const tokenGenerator = require('../src/token_generator');

test('generates a new token', () => {
  const identity = 'alice';
  const room = 'example';

  const token = tokenGenerator(identity, room);
  const decoded = jwt.decode(token, { complete: true });

  expect(decoded).toHaveProperty('payload.grants', {
    identity: identity,
    video: { room: room }
  });
});
