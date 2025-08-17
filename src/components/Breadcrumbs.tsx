import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/videos': 'Videos',
  '/analytics': 'Analytics',
  '/ai-generate': 'AI Generate',
  '/brain-search': 'Brain Search',
  '/content-ideas': 'Content Ideas',
  '/viral-analyzer': 'Analizador Viral',
  '/context': 'Contexto',
  '/settings': 'Settings'
};

const routeParents: Record<string, string> = {
  '/videos/:id': '/videos',
  '/settings/profile': '/settings',
  '/settings/data': '/settings'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with Dashboard as home
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard'
    });
    
    // Handle special cases
    if (location.pathname.startsWith('/videos/') && location.pathname !== '/videos') {
      breadcrumbs.push({
        label: 'Videos',
        href: '/videos'
      });
      breadcrumbs.push({
        label: 'Video Detail',
        current: true
      });
      return breadcrumbs;
    }
    
    // Standard routes
    const currentRoute = `/${pathSegments.join('/')}`;
    if (currentRoute !== '/dashboard' && routeLabels[currentRoute]) {
      breadcrumbs.push({
        label: routeLabels[currentRoute],
        current: true
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();
  
  // Don't show breadcrumbs if we're only at Dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-text-muted mb-lg" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-text-muted" />
            )}
            
            {breadcrumb.current ? (
              <span className="text-text-primary font-medium" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.href!}
                className={cn(
                  "hover:text-text-secondary transition-fast",
                  index === 0 && "flex items-center gap-1"
                )}
              >
                {index === 0 && <Home className="w-3 h-3" />}
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};