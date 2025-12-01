import { AuthGuard } from '@nestjs/passport';

export class JwtOptionalGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    console.log(user);
    return user || null;
  }
}
