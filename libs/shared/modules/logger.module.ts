import { Module, DynamicModule } from '@nestjs/common';
import { StructuredLogger } from './structured-logger.service';

@Module({})
export class SharedLoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: SharedLoggerModule,
      providers: [
        {
          provide: StructuredLogger,
          useValue: new StructuredLogger(serviceName),
        },
      ],
      exports: [StructuredLogger],
    };
  }
}