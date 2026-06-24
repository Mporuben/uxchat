// API endpoint to get a short-lived WebSocket authentication token
import { createWsToken } from '../utils/wsToken';

export default defineEventHandler(async (event) => {
  const user = event.context.logtoUser;

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    });
  }

  return createWsToken({
    sub: user.sub,
    username: user.username,
    name: user.name,
  });
});
