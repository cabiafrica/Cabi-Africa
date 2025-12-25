// admin-geofence.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor that attaches a geofence filter to the request based on the admin's assigned city.
 * It expects `request.user.geofence` to contain a string identifier (e.g., "Nairobi").
 * Controllers can read `request.geofence` to apply region‑specific queries.
 */
@Injectable()
export class AdminGeofenceInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user || {};
        const geofence = user.geofence;
        // Attach the geofence to the request for downstream handlers
        request.geofence = geofence;
        // Optionally, you could filter the response here if needed
        return next.handle().pipe(
            map(data => {
                // If the handler returns an array of items, you could filter by geofence here.
                // For now we just pass through.
                return data;
            }),
        );
    }
}
