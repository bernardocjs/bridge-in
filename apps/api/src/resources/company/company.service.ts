import { HttpStatus, Injectable } from '@nestjs/common';
import { MemberRole, MembershipStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { generateSlug, rotateSlugSuffix } from '../../common/helpers/slug';
import { PrismaService } from '../../providers/database/prisma.service';
import { CreateCompanyDto } from './dtos';
import {
  CompanyMeResponse,
  CompanyPublicResponse,
  CompanyResponse,
  MagicLinkResponse,
  MembershipRequestResponse,
  MembershipResponse,
} from './interfaces';

const MAX_SLUG_RETRIES = 3;
const PRISMA_UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new company and assigns the requesting user as ADMIN (auto-approved).
   *
   * @param userId - ID of the user creating the company.
   * @param dto - Company creation payload (name).
   * @returns The newly created company.
   */
  async create(
    userId: string,
    dto: CreateCompanyDto,
  ): Promise<CompanyResponse> {
    await this.ensureUserHasNoMembership(userId);

    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const company = await tx.company.create({
            data: {
              name: dto.name,
              magicLinkSlug: generateSlug(dto.name),
            },
          });

          await tx.companyMembership.create({
            data: {
              userId,
              companyId: company.id,
              role: MemberRole.ADMIN,
              status: MembershipStatus.APPROVED,
              reviewedAt: new Date(),
            },
          });

          return company;
        });
      } catch (error: any) {
        const isSlugCollision =
          error?.code === PRISMA_UNIQUE_VIOLATION &&
          error?.meta?.target?.includes('magicLinkSlug');

        if (!isSlugCollision || attempt === MAX_SLUG_RETRIES - 1) {
          throw error;
        }
      }
    }

    throw new AppException(
      ExceptionCodes.INTERNAL_ERROR,
      'Failed to generate unique slug',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Requests to join an existing company via its magic link slug.
   *
   * @param userId - ID of the user requesting to join.
   * @param magicLinkSlug - The company's magic link identifier.
   * @returns Membership request details with company name and PENDING status.
   */
  async join(
    userId: string,
    magicLinkSlug: string,
  ): Promise<MembershipRequestResponse> {
    await this.ensureUserHasNoMembership(userId);

    const company = await this.prisma.company.findUnique({
      where: { magicLinkSlug },
      select: { id: true, name: true },
    });

    if (!company) {
      throw new AppException(
        ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        'Invalid or expired company link',
        HttpStatus.NOT_FOUND,
      );
    }

    const membership = await this.prisma.$transaction(async (tx) => {
      return tx.companyMembership.create({
        data: {
          userId,
          companyId: company.id,
          role: MemberRole.MEMBER,
          status: MembershipStatus.PENDING,
        },
      });
    });

    return {
      id: membership.id,
      status: membership.status,
      companyName: company.name,
    };
  }

  /**
   * Returns minimal public info about a company identified by its magic link slug.
   *
   * @param slug - The company's magic link slug.
   * @returns Public company information (name only).
   */
  async findByMagicLink(slug: string): Promise<CompanyPublicResponse> {
    const company = await this.prisma.company.findUnique({
      where: { magicLinkSlug: slug },
      select: { name: true },
    });

    if (!company) {
      throw new AppException(
        ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        'Invalid or expired company link',
        HttpStatus.NOT_FOUND,
      );
    }

    return company;
  }

  /**
   * Returns the company the authenticated user belongs to.
   *
   * @param companyId - The company unique identifier.
   * @returns Company details including name, slug and creation date.
   */
  async findUserCompany(companyId: string): Promise<CompanyMeResponse> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, magicLinkSlug: true, createdAt: true },
    });

    if (!company) {
      throw new AppException(
        ExceptionCodes.COMPANY_NOT_FOUND,
        'Company not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return company;
  }

  /**
   * Rotates the magic link slug to invalidate the previous invite URL.
   * Preserves the human-readable prefix derived from the company name and only
   * regenerates the random suffix.
   *
   * @param companyId - The company whose magic link should be rotated.
   * @returns Updated company id and new magic link slug.
   */
  async rotateMagicLink(companyId: string): Promise<MagicLinkResponse> {
    const current = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { magicLinkSlug: true },
    });

    if (!current) {
      throw new AppException(
        ExceptionCodes.COMPANY_NOT_FOUND,
        'Company not found',
        HttpStatus.NOT_FOUND,
      );
    }

    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      try {
        const company = await this.prisma.company.update({
          where: { id: companyId },
          data: { magicLinkSlug: rotateSlugSuffix(current.magicLinkSlug) },
          select: { id: true, magicLinkSlug: true },
        });
        return company;
      } catch (error: any) {
        const isSlugCollision =
          error?.code === PRISMA_UNIQUE_VIOLATION &&
          error?.meta?.target?.includes('magicLinkSlug');

        if (!isSlugCollision || attempt === MAX_SLUG_RETRIES - 1) {
          throw error;
        }
      }
    }

    throw new AppException(
      ExceptionCodes.INTERNAL_ERROR,
      'Failed to generate unique slug',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Lists membership requests for a company, optionally filtered by status.
   *
   * @param companyId - The company unique identifier.
   * @param status - Optional membership status filter.
   * @returns Array of membership records.
   */
  async listMembers(
    companyId: string,
    status?: MembershipStatus,
  ): Promise<MembershipResponse[]> {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    return this.prisma.companyMembership.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Reviews (approves or rejects) a pending membership request.
   *
   * @param membershipId - The membership request unique identifier.
   * @param companyId - The company identifier to enforce scoping.
   * @param reviewerId - ID of the admin performing the review.
   * @param newStatus - The new membership status (APPROVED or REJECTED).
   * @returns Updated membership record.
   */
  async reviewMembership(
    membershipId: string,
    companyId: string,
    reviewerId: string,
    newStatus: MembershipStatus,
  ): Promise<MembershipResponse> {
    const membership = await this.prisma.companyMembership.findFirst({
      where: { id: membershipId, companyId },
    });

    if (!membership) {
      throw new AppException(
        ExceptionCodes.MEMBERSHIP_NOT_FOUND,
        'Membership request not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (membership.status !== MembershipStatus.PENDING) {
      throw new AppException(
        ExceptionCodes.MEMBERSHIP_ALREADY_REVIEWED,
        'This membership request has already been reviewed',
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.companyMembership.update({
      where: { id: membershipId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    });
  }

  /**
   * Validates that the user does not already have a membership (any status).
   * @param userId - The user unique identifier.
   * @throws AppException if a membership already exists for the user.
   */
  private async ensureUserHasNoMembership(userId: string): Promise<void> {
    const existing = await this.prisma.companyMembership.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });

    if (existing) {
      const message =
        existing.status === MembershipStatus.PENDING
          ? 'You already have a pending membership request'
          : 'You already belong to a company';
      throw new AppException(
        ExceptionCodes.COMPANY_ALREADY_ASSIGNED,
        message,
        HttpStatus.CONFLICT,
      );
    }
  }
}
