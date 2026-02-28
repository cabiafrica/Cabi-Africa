import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MonitoringService {
    private readonly logger = new Logger(MonitoringService.name);

    trackEvent(event: string, metadata: any = {}) {
        this.logger.log(`[EVENT] ${event}: ${JSON.stringify(metadata)}`);
        // Here you would integrate with Prometheus, Datadog, etc.
    }

    trackMetric(metric: string, value: number, tags: any = {}) {
        this.logger.log(`[METRIC] ${metric}=${value} ${JSON.stringify(tags)}`);
    }

    trackError(error: Error, context: string) {
        this.logger.error(`[ERROR] In ${context}: ${error.message}`, error.stack);
    }
}
