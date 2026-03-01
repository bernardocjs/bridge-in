import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useMyCompany, useRotateLink } from '@/services/hooks/use-company'
import { Button } from '@/presentation/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog'
import { RefreshCw, Check, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/utils'

export function MagicLinkActions() {
  const { data: company } = useMyCompany()
  const rotateLink = useRotateLink()
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const magicLink = company?.magicLinkSlug
    ? `${window.location.origin}/report/${company.magicLinkSlug}`
    : null

  const handleCopyLink = useCallback(() => {
    if (!magicLink) return
    navigator.clipboard.writeText(magicLink)
    setCopied(true)
  }, [magicLink])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleRotateLink = () => {
    rotateLink.mutate(undefined, {
      onSuccess: () => {
        toast.success('Magic link rotated! Old links are now invalid.')
        setRotateDialogOpen(false)
      },
    })
  }

  return (
    <div className='flex gap-2'>
      {magicLink && (
        <Button
          variant={copied ? 'secondary' : 'default'}
          size='sm'
          className={cn(
            'gap-1.5 transition-all duration-200',
            copied &&
              'border-success/20 bg-success/10 text-success-600 hover:bg-success/10',
          )}
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check className='h-4 w-4' /> Copied!
            </>
          ) : (
            <>
              <LinkIcon className='h-4 w-4' /> Copy Report Link
            </>
          )}
        </Button>
      )}

      <Dialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' size='sm'>
            <RefreshCw className='mr-1 h-4 w-4' /> Rotate Link
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate Magic Link?</DialogTitle>
            <DialogDescription>
              This will invalidate the current magic link. Anyone with the old
              link won't be able to submit reports or request to join. A new
              link will be generated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setRotateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleRotateLink}
              disabled={rotateLink.isPending}
            >
              {rotateLink.isPending ? 'Rotating...' : 'Rotate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
