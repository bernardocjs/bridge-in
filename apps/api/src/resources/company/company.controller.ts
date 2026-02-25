import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, Public } from '../../common/decorators';
import { HasCompanyGuard } from '../../common/guards/has-company.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCompanyDto) {
    return this.companyService.create(user.userId, dto);
  }

  @Post('join/:magicLinkSlug')
  join(
    @CurrentUser() user: JwtPayload,
    @Param('magicLinkSlug') magicLinkSlug: string,
  ) {
    return this.companyService.join(user.userId, magicLinkSlug);
  }

  @Public()
  @Get('magic/:slug')
  findByMagicLink(@Param('slug') slug: string) {
    return this.companyService.findByMagicLink(slug);
  }

  @UseGuards(HasCompanyGuard)
  @Get('me')
  findMyCompany(@CurrentUser() user: JwtPayload) {
    return this.companyService.findUserCompany(user.companyId!);
  }

  @UseGuards(HasCompanyGuard)
  @Patch('rotate-link')
  rotateMagicLink(@CurrentUser() user: JwtPayload) {
    return this.companyService.rotateMagicLink(user.companyId!);
  }
}
