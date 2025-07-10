'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  getAllCategories, 
  getCategoriesByGroup,
  getCategoryDefinition,
  CATEGORY_GROUPS,
  type CategoryGroup 
} from '@/lib/constants/categories';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  existingCategories?: Record<string, number>; // category -> count
  allowCustom?: boolean;
  placeholder?: string;
  showAllOption?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  existingCategories = {},
  allowCustom = true,
  placeholder = "Select category...",
  showAllOption = false
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const predefinedCategories = getAllCategories();
  
  // Combine predefined and existing categories
  const allCategories = useMemo(() => {
    const combined = new Set([...predefinedCategories, ...Object.keys(existingCategories)]);
    return Array.from(combined).sort();
  }, [existingCategories]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setShowCustomInput(false);
    setCustomCategory('');
  };

  const handleCustomSubmit = () => {
    if (customCategory.trim()) {
      handleSelect(customCategory.trim());
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>
              No category found.
              {allowCustom && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create custom category
                </Button>
              )}
            </CommandEmpty>

            {/* All Categories option */}
            {showAllOption && (
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => handleSelect('')}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        !value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>All Categories</span>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {Object.values(existingCategories).reduce((a, b) => a + b, 0)}
                  </Badge>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Predefined categories by group */}
            {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
              const groupCategories = getCategoriesByGroup(groupKey as CategoryGroup);
              if (groupCategories.length === 0) return null;

              return (
                <CommandGroup key={groupKey} heading={group.label}>
                  {groupCategories.map((category) => {
                    const definition = getCategoryDefinition(category);
                    const count = existingCategories[category] || 0;
                    const isSelected = value === category;

                    return (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={handleSelect}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span>{category}</span>
                          {definition?.description && (
                            <span className="text-xs text-muted-foreground">
                              - {definition.description}
                            </span>
                          )}
                        </div>
                        {count > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {count}
                          </Badge>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}

            {/* Existing categories not in predefined list */}
            {(() => {
              const customExisting = Object.keys(existingCategories).filter(
                cat => !predefinedCategories.includes(cat)
              );
              
              if (customExisting.length > 0) {
                return (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Other Categories">
                      {customExisting.map((category) => {
                        const count = existingCategories[category] || 0;
                        const isSelected = value === category;

                        return (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={handleSelect}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span>{category}</span>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                              {count}
                            </Badge>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </>
                );
              }
              return null;
            })()}

            {/* Custom category input */}
            {allowCustom && showCustomInput && (
              <>
                <CommandSeparator />
                <div className="p-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomSubmit();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleCustomSubmit}
                      disabled={!customCategory.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Add custom category button */}
            {allowCustom && !showCustomInput && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setShowCustomInput(true)}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create custom category
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}