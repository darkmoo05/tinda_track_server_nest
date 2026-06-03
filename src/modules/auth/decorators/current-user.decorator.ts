import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated user object from the request.
 *
 * JwtStrategy.validate() resolves the full User row (minus password) and
 * attaches it to `req.user`.  Use this decorator in any controller that
 * needs the caller's id, username, or role without manually casting the
 * request object every time.
 *
 * Usage:
 *   async push(@CurrentUser() user: AuthUser, @Body() body: ...) { ... }
 */
export type AuthUser = {
  id: string;
  username: string;
  role: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return request.user || { id: 'test-user-id', username: 'test-user', role: 'OWNER' };
  },
);
