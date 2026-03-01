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
   *
   * @param user - JWT payload of the authenticated user.
   * @param dto - Company creation payload (name).
   * @returns The newly created company.
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
   *
   * @param user - JWT payload of the authenticated user.
   * @param magicLinkSlug - The company's magic link identifier from the URL.
   * @returns Membership request details with company name and PENDING status.
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
   *
   * @param slug - The company's magic link slug.
   * @returns Public company information (name only).
   */
  @ApiOperation({ summary: 'Get company info by magic link slug (public)' })
  @Public()
  @Get('magic/:slug')
  findByMagicLink(@Param('slug') slug: string): Promise<CompanyPublicResponse> {
    return this.companyService.findByMagicLink(slug);
  }

  /**
   * Returns the company the authenticated user belongs to.
   *
   * @param user - JWT payload of the authenticated user.
   * @returns Company details including name, slug and creation date.
   */
  @ApiOperation({ summary: "Return the authenticated user's company" })
  @UseGuards(HasCompanyGuard)
  @Get('me')
  findMyCompany(@CurrentUser() user: JwtPayload): Promise<CompanyMeResponse> {
    return this.companyService.findUserCompany(user.companyId!);
  }

  /**
   * Lists membership requests for the user's company.
   *
   * @param user - JWT payload of the authenticated admin user.
   * @param query - Optional status filter.
   * @returns Array of membership records.
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
   *
   * @param membershipId - The membership request unique identifier.
   * @param user - JWT payload of the authenticated admin user.
   * @param dto - Review payload containing the new membership status.
   * @returns Updated membership record.
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
   *
   * @param user - JWT payload of the authenticated admin user.
   * @returns Updated company id and new magic link slug.
   */
  @ApiOperation({ summary: 'Rotate the company magic link (admin only)' })
  @UseGuards(HasCompanyGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @Patch('rotate-link')
  rotateMagicLink(@CurrentUser() user: JwtPayload): Promise<MagicLinkResponse> {
    return this.companyService.rotateMagicLink(user.companyId!);
  }
}
