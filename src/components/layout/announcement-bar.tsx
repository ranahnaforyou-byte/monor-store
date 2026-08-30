export function AnnouncementBar({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="bg-accent text-center text-xs font-medium text-white">
      <p className="mx-auto max-w-[1200px] px-4 py-2">{text}</p>
    </div>
  );
}
