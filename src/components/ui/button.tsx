import type { MouseEvent } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useRender } from '@base-ui/react/use-render'
import { useSound } from '@/features/audio'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: 'bg-lime text-inset hover:bg-lime-soft',
        outline: 'border border-border-strong text-foreground hover:border-lime/60 hover:text-lime',
        ghost: 'text-muted hover:bg-panel-hover hover:text-foreground',
        link: 'text-lime underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends useRender.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, render, onClick, ...props }: ButtonProps) {
  const { play } = useSound()

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Buttons that are really links stay quiet here: the route change plays
    // the navigation blip a moment later, and two sounds for one press
    // reads as a glitch. See features/audio/hooks/use-navigation-sound.
    if (!(event.currentTarget instanceof HTMLAnchorElement)) play('select')
    onClick?.(event)
  }

  return useRender({
    render: render ?? <button type="button" />,
    props: {
      ...props,
      onClick: handleClick,
      className: cn(buttonVariants({ variant, size }), className),
    },
  })
}
