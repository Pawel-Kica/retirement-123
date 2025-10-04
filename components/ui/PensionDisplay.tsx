interface PensionDisplayProps {
  title: string;
  amount: number;
  subtitle: string;
  formatPLN: (value: number) => string;
  highlighted?: boolean;
  className?: string;
}

export function PensionDisplay({
  title,
  amount,
  subtitle,
  formatPLN,
  highlighted = false,
  className = "",
}: PensionDisplayProps) {
  return (
    <div className={className}>
      <h3
        className={`text-sm mb-2 ${
          highlighted ? "font-bold text-zus-green" : "text-zus-grey-600"
        }`}
      >
        {highlighted && "⭐ "}
        {title}
      </h3>
      <div
        className={`text-3xl font-bold ${
          highlighted ? "text-zus-green" : "text-zus-grey-900"
        }`}
      >
        {formatPLN(amount)}
      </div>
      <p
        className={`text-sm mt-2 ${
          highlighted ? "text-zus-grey-700" : "text-zus-grey-500"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}
