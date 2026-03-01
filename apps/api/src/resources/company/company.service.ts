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
   * @param userId - ID of the authenticated user that will own the company.
   * @param dto - Company creation data (name).
   * @returns The newly created company record.
   */
  async create(
    userId: string,
    dto: CreateCompanyDto,
  ): Promise<{
    id: string;
    name: string;
    magicLinkSlug: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
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
   * @param userId - ID of the authenticated user joining the company.
   * @param magicLinkSlug - Unique slug from the company invite link.
   * @returns The joined company's public info.
   */
  async join(
    userId: string,
    magicLinkSlug: string,
  ): Promise<{ id: string; name: string; magicLinkSlug: string }> {
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
   * @param slug - Magic link slug included in the anonymous report URL.
   * @returns The company's display name.
   */
  async findByMagicLink(slug: string): Promise<{ name: string }> {
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
   * @param companyId - ID of the company from the user's JWT payload.
   * @returns Company details including the magic link slug and creation date.
   */
  async findUserCompany(companyId: string): Promise<{
    id: string;
    name: string;
    magicLinkSlug: string;
    createdAt: Date;
  }> {
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
   * @param companyId - ID of the company whose link will be rotated.
   * @returns The updated company ID and the new magic link slug.
   */
  async rotateMagicLink(
    companyId: string,
  ): Promise<{ id: string; magicLinkSlug: string }> {
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { magicLinkSlug: randomUUID() },
      select: { id: true, magicLinkSlug: true },
    });

    return company;
  }

  /**
   * Validates that the user does not already belong to a company.
   * @param userId - ID of the user to check.
   * @returns Void, or throws if the user is already assigned to a company.
   */
  private async ensureUserHasNoCompany(userId: string): Promise<void> {
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
