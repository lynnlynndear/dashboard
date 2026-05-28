interface PlaceholderProps {
  title: string;
  description: string;
  icon?: string;
}

export function Placeholder({ title, description, icon = '🚧' }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-gray-700 text-lg">{title}</h3>
      <p className="text-sm text-gray-400 mt-2 max-w-sm">{description}</p>
    </div>
  );
}
