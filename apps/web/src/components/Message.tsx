import { AlertCircle, CheckCircle, Info } from "lucide-react";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, { bg: string; text: string; Icon: React.ElementType }> = {
  error: { bg: "bg-red-50 border-red-200", text: "text-red-700", Icon: AlertCircle },
  success: { bg: "bg-green-50 border-green-200", text: "text-green-700", Icon: CheckCircle },
  info: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", Icon: Info },
};

export default function Message({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  const { bg, text, Icon } = styles[variant];
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border ${bg} ${text}`}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <span className="text-sm">{children}</span>
    </div>
  );
}
