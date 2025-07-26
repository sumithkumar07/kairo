'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Grid, List } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  activeFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  placeholder?: string;
  showViewToggle?: boolean;
}

export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filterOptions = [],
  filterLabel = 'Filter',
  viewMode = 'grid',
  onViewModeChange,
  activeFilters = [],
  onRemoveFilter,
  placeholder = 'Search...',
  showViewToggle = true
}: SearchFilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Main search and filter row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filterOptions.length > 0 && onFilterChange && (
            <Select value={selectedFilter} onValueChange={onFilterChange}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* View mode toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && onRemoveFilter && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFilter(filter)}
                className="h-auto w-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}