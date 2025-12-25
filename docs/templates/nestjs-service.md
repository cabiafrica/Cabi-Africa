# NestJS Service Template

- **Description**: Creates a new NestJS service.
- **Target Directory**: `apps/[appName]/backend/src/[moduleName]/[moduleName].service.ts`
- **File Content**:
    ```typescript
    import { Injectable } from '@nestjs/common';

    @Injectable()
    export class [ModuleName]Service {
      getHello(): string {
        return 'Hello from [ModuleName]Service!';
      }
    }
    ```