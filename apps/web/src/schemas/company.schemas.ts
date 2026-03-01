import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be at most 100 characters'),
})

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
