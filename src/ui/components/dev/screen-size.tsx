'use client';

import {
  ArrowDownLeft01Icon,
  ArrowDownRight01Icon,
  ArrowUpLeft01Icon,
  ArrowUpRight01Icon,
  SquareIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/ui/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/shadcn/dropdown-menu';
import { cn } from '@/ui/helpers';
import { useIsMounted } from '@/ui/hooks/use-is-mounted';

import { useScreenSizeStore } from './screen-size.store';

const SIZE_OPTIONS = [
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Medium' },
  { size: 'lg', label: 'Large' },
] as const;

const POSITION_OPTIONS = [
  { pos: 'bottomLeft', label: 'Bottom Left', icon: ArrowDownLeft01Icon },
  { pos: 'bottomRight', label: 'Bottom Right', icon: ArrowDownRight01Icon },
  { pos: 'topRight', label: 'Top Right', icon: ArrowUpRight01Icon },
  { pos: 'topLeft', label: 'Top Left', icon: ArrowUpLeft01Icon },
] as const;

interface Props {
  className?: string;
}

export default function ScreenSize({ className }: Readonly<Props>) {
  const mounted = useIsMounted();

  const { isColored, setIsColored, position, setPosition, size, setSize } =
    useScreenSizeStore();

  if (!mounted || process.env.NODE_ENV !== 'development') return;

  const align =
    position === 'bottomLeft' || position === 'topLeft' ? 'start' : 'end';
  const side =
    position === 'topLeft' || position === 'topRight' ? 'top' : 'bottom';

  const triggerButton = (
    <Button
      variant="outline"
      className={cn(
        'focus-visible:border-border dark:focus-visible:border-input fixed z-40 rounded-full transition-all duration-200 focus-visible:ring-0',
        {
          'bottom-4 left-4': position === 'bottomLeft',
          'right-4 bottom-4': position === 'bottomRight',
          'top-4 right-4': position === 'topRight',
          'top-4 left-4': position === 'topLeft',
          'size-7 text-xs': size === 'sm',
          'size-9 text-sm': size === 'md',
          'text-md size-11': size === 'lg',
          'border-transparent bg-red-600! font-bold text-white sm:bg-orange-400! md:bg-yellow-500! lg:bg-green-400! xl:bg-green-600! 2xl:bg-indigo-500!':
            isColored,
        },
        className,
      )}
    >
      <span className="block sm:hidden">XS</span>
      <span className="hidden sm:block md:hidden">SM</span>
      <span className="hidden md:block lg:hidden">MD</span>
      <span className="hidden lg:block xl:hidden">LG</span>
      <span className="hidden xl:block 2xl:hidden">XL</span>
      <span className="hidden 2xl:block">2XL</span>
    </Button>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger render={triggerButton} />
      <DropdownMenuContent className="w-56" align={align} side={side}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Size</DropdownMenuLabel>
          {SIZE_OPTIONS.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.size}
              checked={size === s.size}
              onCheckedChange={() => setSize(s.size)}
            >
              <HugeiconsIcon
                icon={SquareIcon}
                className={cn('text-muted-foreground', {
                  'size-2': s.size === 'sm',
                  'size-2.5': s.size === 'md',
                  'size-3': s.size === 'lg',
                })}
                aria-hidden="true"
              />
              {s.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Position</DropdownMenuLabel>
          {POSITION_OPTIONS.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.pos}
              checked={position === p.pos}
              onCheckedChange={() => setPosition(p.pos)}
            >
              <HugeiconsIcon
                icon={p.icon}
                className="text-muted-foreground"
                aria-hidden="true"
              />
              {p.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isColored}
          onCheckedChange={setIsColored}
        >
          Colored Mode
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
