'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Search, 
  BarChart3, 
  Users, 
  FileText, 
  Shield, 
  Brain,
  Home,
  Sparkles,
  GitBranch,
  Lightbulb,
  LogOut,
  User,
  Layers,
  Globe,
  MoreHorizontal,
  Menu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConnectionStatus } from '@/components/connection-status';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home, priority: 1 },
  { href: '/projects', label: 'Projects', icon: FileText, priority: 1 },
  { href: '/repositories', label: 'Repositories', icon: GitBranch, priority: 2 },
  { href: '/deployments', label: 'Deployments', icon: Globe, priority: 3 },
  { href: '/categories', label: 'Categories', icon: Layers, priority: 3 },
  { href: '/search', label: 'Search', icon: Search, priority: 2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, priority: 2 },
  { href: '/qa', label: 'QA', icon: Shield, priority: 1 },
  { href: '/insights', label: 'Insights', icon: Lightbulb, priority: 3 },
  { href: '/collaborate', label: 'Collaborate', icon: Users, priority: 3 },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Separate items by priority for responsive display
  const priorityItems = navItems.filter(item => item.priority === 1);
  const secondaryItems = navItems.filter(item => item.priority === 2);
  const moreItems = navItems.filter(item => item.priority === 3);

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || 
      (item.href !== '/' && pathname.startsWith(item.href));
    
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className="relative px-3 py-2 text-sm font-medium transition-colors rounded-lg group"
      >
        <motion.div
          className={cn(
            "flex items-center space-x-2",
            isActive 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </motion.div>
        
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        )}
      </Link>
    );
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center">
          <Link href="/" className="mr-4 lg:mr-8 flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-6 w-6 text-purple-500" />
            </motion.div>
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Masterlist
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Priority items always visible */}
            {priorityItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            
            {/* Secondary items visible on xl screens */}
            <div className="hidden xl:flex items-center space-x-1">
              {secondaryItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
            
            {/* More dropdown for remaining items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="ml-2 hidden xl:inline">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {/* Show secondary items on lg screens */}
                <div className="xl:hidden">
                  {secondaryItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || 
                      (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className={cn(isActive && "text-primary")}>
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="xl:hidden" />
                </div>
                
                {/* Always show more items */}
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className={cn(isActive && "text-primary")}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-end space-x-2 ml-auto">
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Quick search..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 text-sm rounded-full border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`;
                  }
                }}
              />
            </motion.div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <ConnectionStatus variant="minimal" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ThemeToggle />
            </motion.div>
            
            {loading ? (
              <div className="h-9 w-9 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  asChild
                  variant="default" 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  <Link href="/login">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            )}
          </nav>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden border-t bg-background/95 backdrop-blur"
        >
          <div className="container py-4 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4 md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Quick search..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`;
                    setMobileMenuOpen(false);
                  }
                }}
              />
            </div>
            
            {/* Mobile Nav Links */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}