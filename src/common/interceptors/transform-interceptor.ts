import { Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context, next) {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
      })),
    );
  }
}
