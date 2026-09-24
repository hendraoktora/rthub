import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GempaService, GempaData } from './gempa.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gempa BMKG')
@Controller('gempa')
export class GempaController {
  constructor(private readonly gempaService: GempaService) {}

  @Get('terkini')
  @ApiOperation({ summary: 'Dapatkan informasi gempa bumi terkini dari BMKG (real-time/cached)' })
  async getTerkini() {
    const data = await this.gempaService.getGempaTerkini();
    return {
      status: 'success',
      data,
    };
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Broadcast peringatan gempa ke seluruh HP warga via push notification' })
  async broadcast(@Req() req: any, @Body() body: GempaData) {
    return this.gempaService.broadcastGempa(req.user, body);
  }
}
