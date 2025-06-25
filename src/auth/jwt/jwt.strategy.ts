import { Injectable } from "@nestjs/common";
import { ConfigService,ConfigModule } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt,Strategy } from "passport-jwt"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWTKEY'),
    });
  }

  async validate(payload: any) {
    return { profile: payload };
  }
}