import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { PrismaService } from '../../providers/database/prisma.service';
import { CreateCompanyDto } from './dtos';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new company and assigns the requesting user to it.
   * Both operations happen atomically in a transaction.
   */
  async create(userId: string, dto: CreateCompanyDto) {
    await this.ensureUserHasNoCompany(userId);

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: dto.name,
          magicLinkSlug: randomUUID(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { companyId: company.id },
      });

      return company;
    });
  }

  /**
   * Joins an existing company via its magic link slug.
   */
  async join(userId: string, magicLinkSlug: string) {
    await this.ensureUserHasNoCompany(userId);

    const company = await this.prisma.company.findUnique({
      where: { magicLinkSlug },
      select: { id: true, name: true, magicLinkSlug: true },
    });

    if (!company) {
      throw new AppException(
        ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        'Invalid or expired company link',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id },
    });

    return company;
  }

  /**
   * Returns minimal public info for the anonymous report form.
   */
  async findByMagicLink(slug: string) {
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
  async findUserCompany(companyId: string) {
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
  async rotateMagicLink(companyId: string) {
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { magicLinkSlug: randomUUID() },
      select: { id: true, magicLinkSlug: true },
    });

    return company;
  }

  private async ensureUserHasNoCompany(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (user?.companyId) {
      throw new AppException(
        ExceptionCodes.COMPANY_ALREADY_ASSIGNED,
        'You already belong to a company',
        HttpStatus.CONFLICT,
      );
    }
  }
}
