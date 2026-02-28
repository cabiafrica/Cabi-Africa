import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const delay = Date.now() - now;
                    this.logger.log(`${method} ${url} ${ip} ${delay}ms`);
                },
                error: (err) => {
                    const delay = Date.now() - now;
                    this.logger.error(`${method} ${url} ${ip} ${delay}ms - ${err.message}`);
                },
            }),
        );
    }
}
