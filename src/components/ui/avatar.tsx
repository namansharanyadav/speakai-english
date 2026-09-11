import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  className,
}: {
  name?: string | null;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(
          "size-10 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
          className,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid size-10 place-items-center rounded-full bg-primary-soft font-medium text-primary",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
