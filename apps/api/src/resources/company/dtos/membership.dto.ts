import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MembershipStatus } from '@prisma/client';

export class ReviewMembershipDto {
  @ApiProperty({
    enum: [MembershipStatus.APPROVED, MembershipStatus.REJECTED],
    example: MembershipStatus.APPROVED,
    description: 'New status for the membership request',
  })
  @IsEnum(MembershipStatus, {
    message: 'Status must be APPROVED or REJECTED',
  })
  status: MembershipStatus;
}

export class QueryMembershipDto {
  @ApiProperty({
    enum: MembershipStatus,
    example: MembershipStatus.PENDING,
    description: 'Filter by membership status',
    required: false,
  })
  @IsEnum(MembershipStatus)
  @IsOptional()
  status?: MembershipStatus;
}
