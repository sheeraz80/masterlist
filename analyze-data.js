const fs = require('fs');

// Read the projects data
const projectsData = JSON.parse(fs.readFileSync('./data/projects.json', 'utf-8'));

// Extract unique tags from key_features
const allTags = new Set();
const categories = new Set();

projectsData.forEach(project => {
  // Add category
  if (project.category) {
    categories.add(project.category);
  }
  
  // Extract potential tags from key_features
  if (project.key_features && Array.isArray(project.key_features)) {
    project.key_features.forEach(feature => {
      // Extract keywords that could be tags (words that appear frequently)
      const words = feature.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !['with', 'from', 'that', 'this', 'your', 'into', 'more', 'than', 'when', 'where', 'which', 'while', 'after', 'before', 'during', 'without', 'about', 'against', 'between', 'through', 'under', 'over', 'above', 'below', 'each', 'every', 'these', 'those', 'such', 'some', 'many', 'much', 'most', 'other', 'another', 'either', 'neither', 'both', 'same', 'different'].includes(word));
      
      words.forEach(word => {
        if (word.length > 4) {
          allTags.add(word);
        }
      });
    });
  }
});

console.log(`Total Projects: ${projectsData.length}`);
console.log(`Unique Categories: ${categories.size}`);
console.log(`\nCategories:`);
[...categories].sort().forEach(cat => console.log(`  - ${cat}`));

// Count most common potential tags
const tagCounts = {};
projectsData.forEach(project => {
  if (project.key_features && Array.isArray(project.key_features)) {
    project.key_features.forEach(feature => {
      const words = feature.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 4 && !['with', 'from', 'that', 'this', 'your', 'into', 'more', 'than', 'when', 'where', 'which', 'while', 'after', 'before', 'during', 'without', 'about', 'against', 'between', 'through', 'under', 'over', 'above', 'below', 'each', 'every', 'these', 'those', 'such', 'some', 'many', 'much', 'most', 'other', 'another', 'either', 'neither', 'both', 'same', 'different'].includes(word));
      
      words.forEach(word => {
        tagCounts[word] = (tagCounts[word] || 0) + 1;
      });
    });
  }
});

// Get top 77 most common tags (to match Python version)
const sortedTags = Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 77)
  .map(([tag]) => tag);

console.log(`\nTop 77 Most Common Tags/Keywords: ${sortedTags.length}`);
console.log(sortedTags.slice(0, 20).join(', ') + '...');

// Check for any missing projects by looking at the masterlist.txt
const masterlistContent = fs.readFileSync('./masterlist.txt', 'utf-8');
const projectMatches = masterlistContent.match(/^PROJECT \d+:/gm);
console.log(`\nProjects in masterlist.txt: ${projectMatches ? projectMatches.length : 0}`);

// Additional analysis
const platforms = new Set();
projectsData.forEach(project => {
  if (project.platform) {
    platforms.add(project.platform);
  }
});

console.log(`\nUnique Platforms: ${platforms.size}`);
[...platforms].sort().forEach(plat => console.log(`  - ${plat}`));