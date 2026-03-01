import { z } from 'zod'

export const createReportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be at most 255 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be at most 50,000 characters'),
  reporterContact: z
    .string()
    .email('Must be a valid email')
    .optional()
    .or(z.literal('')),
})

export type CreateReportFormData = z.infer<typeof createReportSchema>
