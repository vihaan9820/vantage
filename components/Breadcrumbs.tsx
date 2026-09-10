import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto py-1 hide-scrollbar ${className}`}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors shrink-0"
      >
        <Home size={13} className="text-[#6366F1]" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.label} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight size={12} className="text-gray-600 shrink-0" />
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? "page" : undefined}
                className="font-medium text-white truncate max-w-[200px]"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors truncate max-w-[160px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
