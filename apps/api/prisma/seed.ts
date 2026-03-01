import {
  MemberRole,
  MembershipStatus,
  PrismaClient,
  ReportPriority,
  ReportStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_SLUG = 'demo-company-2024';
const ADMIN_EMAIL = 'admin@bridge.in';
const ADMIN_PASSWORD = 'password123';

async function main() {
  const company = await prisma.company.upsert({
    where: { magicLinkSlug: DEMO_SLUG },
    update: {},
    create: {
      name: 'Bridge In Demo',
      magicLinkSlug: DEMO_SLUG,
    },
  });

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  await prisma.companyMembership.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: MemberRole.ADMIN,
      status: MembershipStatus.APPROVED,
      reviewedAt: new Date(),
    },
  });

  const reports = [
    {
      title: 'Suspicious financial transactions',
      content:
        'I noticed irregular transfers in Q4 reports that dont match our vendor list. Multiple payments to unknown entities totaling over 50k.',
      status: ReportStatus.OPEN,
      priority: ReportPriority.CRITICAL,
    },
    {
      title: 'Workplace harassment incident',
      content:
        'A colleague has been making inappropriate comments during team meetings. This has been ongoing for the past 3 months and affects team morale.',
      status: ReportStatus.IN_PROGRESS,
      priority: ReportPriority.HIGH,
      reporterContact: 'anonymous-7832@proton.me',
    },
    {
      title: 'Safety protocol violations in warehouse',
      content:
        'Workers on the night shift are consistently skipping mandatory safety checks. Emergency exits have been blocked with inventory on multiple occasions.',
      status: ReportStatus.OPEN,
      priority: ReportPriority.HIGH,
    },
    {
      title: 'Data privacy concerns',
      content:
        'Customer personal data is being stored in unencrypted spreadsheets shared across multiple departments without proper access controls.',
      status: ReportStatus.RESOLVED,
      priority: ReportPriority.CRITICAL,
    },
    {
      title: 'Expense report irregularities',
      content:
        'Several team leads are submitting duplicate expense reports for the same business trips. The amounts seem inflated compared to actual travel costs.',
      status: ReportStatus.OPEN,
      priority: ReportPriority.MEDIUM,
    },
    {
      title: 'Vendor kickback allegations',
      content:
        'The procurement department appears to be favoring a specific vendor despite higher quotes. There may be undisclosed personal relationships involved.',
      status: ReportStatus.DISMISSED,
      priority: ReportPriority.MEDIUM,
    },
    {
      title: 'Overtime policy not being followed',
      content:
        'Junior employees are being pressured to work overtime without proper compensation. Timesheets are being edited by managers to hide extra hours.',
      status: ReportStatus.IN_PROGRESS,
      priority: ReportPriority.LOW,
    },
    {
      title: 'Environmental compliance issue',
      content:
        'Chemical waste from the manufacturing floor is not being disposed of according to local regulations. Disposal logs appear to be falsified.',
      status: ReportStatus.OPEN,
      priority: ReportPriority.HIGH,
    },
  ];

  for (const report of reports) {
    await prisma.report.create({
      data: {
        ...report,
        companyId: company.id,
      },
    });
  }

  console.log('Seed completed successfully');
  console.log(`  Company: ${company.name} (slug: ${DEMO_SLUG})`);
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Reports: ${reports.length} created`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
