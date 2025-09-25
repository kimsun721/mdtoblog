import { Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context, next) {
    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse();
        if (res.headersSent) return data; // 이미 redirect나 res.json 썼으면 그냥 원본 반환
        return {
          statusCode: res.statusCode,
          data,
        };
      }),
    );
  }
}
