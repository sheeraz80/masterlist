'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PopularTagsProps {
  tags: Record<string, number>;
}

export function PopularTags({ tags }: PopularTagsProps) {
  // Sort tags by count and get top 15
  const sortedTags = Object.entries(tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const maxCount = sortedTags[0]?.[1] || 1;

  // Color palette for tags
  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'bg-red-100 text-red-800 hover:bg-red-200',
      'bg-orange-100 text-orange-800 hover:bg-orange-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-purple-500" />
          Popular Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count], index) => {
              const size = Math.max(0.8, (count / maxCount) * 1.5);
              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link href={`/search?tags=${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="secondary"
                      className={`cursor-pointer transition-all ${getTagColor(index)}`}
                      style={{ fontSize: `${size}rem` }}
                    >
                      {tag}
                      <span className="ml-1 opacity-60">({count})</span>
                    </Badge>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(tags).length}
                </div>
                <div className="text-muted-foreground">Total Tags</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {sortedTags[0]?.[1] || 0}
                </div>
                <div className="text-muted-foreground">Most Used</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}