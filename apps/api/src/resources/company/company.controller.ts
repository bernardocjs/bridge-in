import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { HasCompanyGuard } from '../../common/guards/has-company.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CompanyService } from './company.service';
import {
  CreateCompanyDto,
  QueryMembershipDto,
  ReviewMembershipDto,
} from './dtos';
import {
  CompanyMeResponse,
  CompanyPublicResponse,
  CompanyResponse,
  MagicLinkResponse,
  MembershipRequestResponse,
  MembershipResponse,
} from './interfaces';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Creates a new company and assigns the authenticated user as its admin.
   */
  @ApiOperation({ summary: 'Create a company and become its admin' })
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCompanyDto,
  ): Promise<CompanyResponse> {
    return this.companyService.create(user.userId, dto);
  }

  /**
   * Requests to join an existing company using a magic link slug.
   * The request will be PENDING until an admin approves it.
   */
  @ApiOperation({ summary: 'Request to join a company via magic link' })
  @Post('join/:magicLinkSlug')
  join(
    @CurrentUser() user: JwtPayload,
    @Param('magicLinkSlug') magicLinkSlug: string,
  ): Promise<MembershipRequestResponse> {
    return this.companyService.join(user.userId, magicLinkSlug);
  }

  /**
   * Returns public company info for the anonymous report submission form.
   */
  @ApiOperation({ summary: 'Get company info by magic link slug (public)' })
  @Public()
  @Get('magic/:slug')
  findByMagicLink(@Param('slug') slug: string): Promise<CompanyPublicResponse> {
    return this.companyService.findByMagicLink(slug);
  }

  /**
   * Returns the company the authenticated user belongs to.
   */
  @ApiOperation({ summary: "Return the authenticated user's company" })
  @UseGuards(HasCompanyGuard)
  @Get('me')
  findMyCompany(@CurrentUser() user: JwtPayload): Promise<CompanyMeResponse> {
    return this.companyService.findUserCompany(user.companyId!);
  }

  /**
   * Lists membership requests for the user's company.
   * Only accessible by company ADMINs.
   */
  @ApiOperation({ summary: 'List company members/requests (admin only)' })
  @UseGuards(HasCompanyGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @Get('members')
  listMembers(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryMembershipDto,
  ): Promise<MembershipResponse[]> {
    return this.companyService.listMembers(user.companyId!, query.status);
  }

  /**
   * Approves or rejects a pending membership request.
   * Only accessible by company ADMINs.
   */
  @ApiOperation({ summary: 'Review a membership request (admin only)' })
  @UseGuards(HasCompanyGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @Patch('members/:membershipId')
  reviewMembership(
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewMembershipDto,
  ): Promise<MembershipResponse> {
    return this.companyService.reviewMembership(
      membershipId,
      user.companyId!,
      user.userId,
      dto.status,
    );
  }

  /**
   * Rotates the company's magic link to invalidate the previous invite URL.
   * Only accessible by company ADMINs.
   */
  @ApiOperation({ summary: 'Rotate the company magic link (admin only)' })
  @UseGuards(HasCompanyGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @Patch('rotate-link')
  rotateMagicLink(@CurrentUser() user: JwtPayload): Promise<MagicLinkResponse> {
    return this.companyService.rotateMagicLink(user.companyId!);
  }
}
