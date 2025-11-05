import { AuthGuard } from '@nestjs/passport';

export class JwtOptionalGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    return user || null;
  }
}
