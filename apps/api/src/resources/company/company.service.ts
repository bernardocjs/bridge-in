import { HttpStatus, Injectable } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
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

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new company and assigns the requesting user as ADMIN (auto-approved).
   * Both operations happen atomically in a transaction.
   */
  async create(
    userId: string,
    dto: CreateCompanyDto,
  ): Promise<CompanyResponse> {
    await this.ensureUserHasNoMembership(userId);

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: dto.name,
          magicLinkSlug: randomUUID(),
        },
      });

      await tx.companyMembership.create({
        data: {
          userId,
          companyId: company.id,
          role: 'ADMIN',
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      });

      return company;
    });
  }

  /**
   * Requests to join an existing company via its magic link slug.
   * Creates a PENDING membership that must be approved by an ADMIN.
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
          role: 'MEMBER',
          status: 'PENDING',
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
   * Returns minimal public info for the anonymous report form.
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
   * Rotates the magic link slug for security purposes.
   */
  async rotateMagicLink(companyId: string): Promise<MagicLinkResponse> {
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { magicLinkSlug: randomUUID() },
      select: { id: true, magicLinkSlug: true },
    });

    return company;
  }

  /**
   * Lists membership requests for a company, optionally filtered by status.
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
   * Reviews (approves/rejects) a pending membership request.
   * Only callable by company ADMINs.
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

    if (membership.status !== 'PENDING') {
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
   */
  private async ensureUserHasNoMembership(userId: string): Promise<void> {
    const existing = await this.prisma.companyMembership.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });

    if (existing) {
      const message =
        existing.status === 'PENDING'
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
