import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health & Status')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root Server Status' })
  getRoot() {
    return {
      name: 'RtHub REST API Server',
      status: 'active',
      version: '1.0.0',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api')
  @ApiOperation({ summary: 'API Base Status' })
  getApiRoot() {
    return {
      name: 'RtHub REST API Server',
      status: 'active',
      version: '1.0.0',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
