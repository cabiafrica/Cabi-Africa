# NestJS Controller Template

- **Description**: Creates a new NestJS controller.
- **Target Directory**: `apps/[appName]/backend/src/[moduleName]/[moduleName].controller.ts`
- **File Content**:
    ```typescript
    import { Controller, Get } from '@nestjs/common';
    import { [ModuleName]Service } from './[moduleName].service';

    @Controller('[moduleName]')
    export class [ModuleName]Controller {
      constructor(private readonly [moduleName]Service: [ModuleName]Service) {}

      @Get()
      getHello(): string {
        return this.[moduleName]Service.getHello();
      }
    }
    ```