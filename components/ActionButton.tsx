import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      {label}
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );
}
