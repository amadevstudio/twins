import { cn } from "@/lib/utils";

export default function Loader({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "box-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black border-b-transparent",
        className,
      )}
    ></div>
  );
}
