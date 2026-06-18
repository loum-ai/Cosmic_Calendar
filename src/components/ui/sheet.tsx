import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet built on Radix Dialog. Close is robust by construction:
 * ESC, backdrop tap, the X button and (on touch) swipe-down all dismiss it.
 * This is the single Overlay primitive — fixes the recurring "Close
 * funktioniert nicht" bug at the root.
 */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const startY = React.useRef<number | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-[rgba(4,4,10,0.62)] backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (startY.current !== null && e.changedTouches[0].clientY - startY.current > 70) {
            closeRef.current?.click();
          }
          startY.current = null;
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[61] mx-auto max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-sheet border-t border-lilac/25 bg-[rgba(20,16,32,0.97)] px-6 pb-10 pt-4 shadow-[0_-30px_70px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        {/* grabber */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <DialogPrimitive.Close
          ref={closeRef}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-ink-soft/70 transition hover:bg-white/[0.12] active:scale-90"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Schließen</span>
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent };
