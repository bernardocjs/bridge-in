import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../../common/decorators';
import { HasCompanyGuard } from '../../common/guards/has-company.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Creates a new company and assigns the authenticated user as its owner.
   * @param dto - Company name.
   * @returns The newly created company record.
   */
  @ApiOperation({ summary: 'Create a company and become its owner' })
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCompanyDto,
  ): ReturnType<CompanyService['create']> {
    return this.companyService.create(user.userId, dto);
  }

  /**
   * Joins an existing company using a magic link slug.
   * @param magicLinkSlug - Unique slug from the company invite link.
   * @returns The joined company's public info.
   */
  @ApiOperation({ summary: 'Join a company via magic link' })
  @Post('join/:magicLinkSlug')
  join(
    @CurrentUser() user: JwtPayload,
    @Param('magicLinkSlug') magicLinkSlug: string,
  ): ReturnType<CompanyService['join']> {
    return this.companyService.join(user.userId, magicLinkSlug);
  }

  /**
   * Returns public company info for the anonymous report submission form.
   * @param slug - Magic link slug from the anonymous report URL.
   * @returns The company's display name.
   */
  @ApiOperation({ summary: 'Get company info by magic link slug (public)' })
  @Public()
  @Get('magic/:slug')
  findByMagicLink(
    @Param('slug') slug: string,
  ): ReturnType<CompanyService['findByMagicLink']> {
    return this.companyService.findByMagicLink(slug);
  }

  /**
   * Returns the company the authenticated user belongs to.
   * @returns Company details including the magic link slug and creation date.
   */
  @ApiOperation({ summary: "Return the authenticated user's company" })
  @UseGuards(HasCompanyGuard)
  @Get('me')
  findMyCompany(
    @CurrentUser() user: JwtPayload,
  ): ReturnType<CompanyService['findUserCompany']> {
    return this.companyService.findUserCompany(user.companyId!);
  }

  /**
   * Rotates the company's magic link to invalidate the previous invite URL.
   * @returns The updated company ID and the new magic link slug.
   */
  @ApiOperation({ summary: 'Rotate the company magic link' })
  @UseGuards(HasCompanyGuard)
  @Patch('rotate-link')
  rotateMagicLink(
    @CurrentUser() user: JwtPayload,
  ): ReturnType<CompanyService['rotateMagicLink']> {
    return this.companyService.rotateMagicLink(user.companyId!);
  }
}
