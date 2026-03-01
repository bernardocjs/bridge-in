import { MembershipStatus } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { SlidersHorizontal } from 'lucide-react'

const ALL_VALUE = '__all__'

interface MembersFilterProps {
  value: MembershipStatus | undefined
  onChange: (value: MembershipStatus | undefined) => void
}

export function MembersFilter({ value, onChange }: MembersFilterProps) {
  return (
    <div className='mb-6 rounded-xl border border-border/60 bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 dark:bg-neutral-700'>
          <SlidersHorizontal className='h-4 w-4' />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium tracking-wider text-neutral-400 uppercase'>
            Status
          </label>
          <Select
            value={value ?? ALL_VALUE}
            onValueChange={v =>
              onChange(v === ALL_VALUE ? undefined : (v as MembershipStatus))
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Members</SelectItem>
              {Object.values(MembershipStatus).map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
