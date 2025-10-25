import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res =
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error';

      let message = res['message'];
      const error = res['error'];

      if (Array.isArray(message)) {
        message = message.join(',');
      }

      response.status(status).json({
        statusCode: exception.getStatus(),
        message,
        error,
      });
    } else if (exception instanceof QueryFailedError) {
      const exceptionName = exception.driverError.code;
      let status;
      let message;
      if (exceptionName == 'ER_DUP_ENTRY') {
        status = 409;
        message = 'Duplicate Error';
      } else {
        console.log(exception);
        status = 500;
        message = 'Internal Server Error';
      }
      response.status(status).json({
        statusCode: status,
        message,
      });
    } else if (exception.response) {
      const status = Number(exception.response.data.status);
      const message: string = exception.response.data.message;
      console.log(exception);
      console.log(status, message);
      response.status(status).json({
        statusCode: status,
        message,
      });
    } else {
      console.log(exception, 'internal server exception');
      const message = 'INTERNAL_SERVER_ERROR';
      response.status(500).json({
        statusCode: 500,
        message,
      });
    }
    if (!response.headersSent) {
      response.status(200);
    }
  }
}
