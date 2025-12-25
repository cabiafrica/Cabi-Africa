const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\libs\\backend';

const services = [
    {
        name: 'driver-lead-service',
        className: 'DriverLead',
        description: 'Handles web-based driver registration and lead capture.'
    },
    {
        name: 'mlm-service',
        className: 'Mlm',
        description: 'Manages referral hierarchies and fee distribution.'
    },
    {
        name: 'dispatch-service',
        className: 'Dispatch',
        description: 'Matches rides to drivers and manages logistics.'
    }
];

function createService(service) {
    const serviceDir = path.join(BACKEND_ROOT, service.name, 'src');
    if (fs.existsSync(serviceDir)) {
        console.log(`Service ${service.name} already exists. Skipping.`);
        return;
    }

    fs.mkdirSync(serviceDir, { recursive: true });

    // 1. Controller
    const controllerContent = `import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ${service.className}Service } from './${service.name}.service';

@Controller('${service.name}')
export class ${service.className}Controller {
  constructor(private readonly service: ${service.className}Service) {}

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: '${service.name}' };
  }
}
`;
    fs.writeFileSync(path.join(serviceDir, `${service.name}.controller.ts`), controllerContent);

    // 2. Service
    const serviceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${service.className}Service {
  // ${service.description}
  
  constructor() {}
}
`;
    fs.writeFileSync(path.join(serviceDir, `${service.name}.service.ts`), serviceContent);

    // 3. Module
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${service.className}Controller } from './${service.name}.controller';
import { ${service.className}Service } from './${service.name}.service';

@Module({
  controllers: [${service.className}Controller],
  providers: [${service.className}Service],
  exports: [${service.className}Service],
})
export class ${service.className}Module {}
`;
    fs.writeFileSync(path.join(serviceDir, `${service.name}.module.ts`), moduleContent);

    // 4. Index (Barrel)
    fs.writeFileSync(path.join(serviceDir, 'index.ts'), `export * from './${service.name}.module';\nexport * from './${service.name}.service';\n`);

    console.log(`Created scaffold for ${service.name}`);
}

console.log('Scaffolding missing backend services...');
services.forEach(createService);
console.log('Backend services initialized.');
