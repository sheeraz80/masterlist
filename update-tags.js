const fs = require('fs');

// Read the projects data
const projectsData = JSON.parse(fs.readFileSync('./data/projects.json', 'utf-8'));

// Common words to exclude
const stopWords = new Set(['with', 'from', 'that', 'this', 'your', 'into', 'more', 'than', 'when', 'where', 'which', 'while', 'after', 'before', 'during', 'without', 'about', 'against', 'between', 'through', 'under', 'over', 'above', 'below', 'each', 'every', 'these', 'those', 'such', 'some', 'many', 'much', 'most', 'other', 'another', 'either', 'neither', 'both', 'same', 'different', 'using', 'based', 'allows', 'within', 'across', 'provides', 'including', 'creates', 'making', 'having']);

// Extract tags from text
function extractTags(text) {
  const tags = new Set();
  
  // Extract specific patterns
  if (text.toLowerCase().includes('ai')) tags.add('AI');
  if (text.toLowerCase().includes('automation')) tags.add('Automation');
  if (text.toLowerCase().includes('export')) tags.add('Export');
  if (text.toLowerCase().includes('import')) tags.add('Import');
  if (text.toLowerCase().includes('template')) tags.add('Templates');
  if (text.toLowerCase().includes('real-time') || text.toLowerCase().includes('realtime')) tags.add('Real-time');
  if (text.toLowerCase().includes('collaboration')) tags.add('Collaboration');
  if (text.toLowerCase().includes('sync')) tags.add('Sync');
  if (text.toLowerCase().includes('analytics')) tags.add('Analytics');
  if (text.toLowerCase().includes('dashboard')) tags.add('Dashboard');
  if (text.toLowerCase().includes('integration')) tags.add('Integration');
  if (text.toLowerCase().includes('api')) tags.add('API');
  if (text.toLowerCase().includes('design')) tags.add('Design');
  if (text.toLowerCase().includes('component')) tags.add('Components');
  if (text.toLowerCase().includes('style')) tags.add('Styling');
  if (text.toLowerCase().includes('color')) tags.add('Colors');
  if (text.toLowerCase().includes('font')) tags.add('Typography');
  if (text.toLowerCase().includes('image')) tags.add('Images');
  if (text.toLowerCase().includes('icon')) tags.add('Icons');
  if (text.toLowerCase().includes('crypto')) tags.add('Crypto');
  if (text.toLowerCase().includes('blockchain')) tags.add('Blockchain');
  if (text.toLowerCase().includes('defi')) tags.add('DeFi');
  if (text.toLowerCase().includes('nft')) tags.add('NFT');
  if (text.toLowerCase().includes('wallet')) tags.add('Wallet');
  if (text.toLowerCase().includes('security')) tags.add('Security');
  if (text.toLowerCase().includes('privacy')) tags.add('Privacy');
  if (text.toLowerCase().includes('markdown')) tags.add('Markdown');
  if (text.toLowerCase().includes('pdf')) tags.add('PDF');
  if (text.toLowerCase().includes('chart') || text.toLowerCase().includes('graph')) tags.add('Charts');
  if (text.toLowerCase().includes('database')) tags.add('Database');
  if (text.toLowerCase().includes('search')) tags.add('Search');
  if (text.toLowerCase().includes('filter')) tags.add('Filters');
  if (text.toLowerCase().includes('sort')) tags.add('Sorting');
  if (text.toLowerCase().includes('notification')) tags.add('Notifications');
  if (text.toLowerCase().includes('email')) tags.add('Email');
  if (text.toLowerCase().includes('calendar')) tags.add('Calendar');
  if (text.toLowerCase().includes('task')) tags.add('Tasks');
  if (text.toLowerCase().includes('project')) tags.add('Project Management');
  if (text.toLowerCase().includes('team')) tags.add('Team');
  if (text.toLowerCase().includes('code')) tags.add('Code');
  if (text.toLowerCase().includes('debug')) tags.add('Debugging');
  if (text.toLowerCase().includes('test')) tags.add('Testing');
  if (text.toLowerCase().includes('lint')) tags.add('Linting');
  if (text.toLowerCase().includes('format')) tags.add('Formatting');
  if (text.toLowerCase().includes('git')) tags.add('Git');
  if (text.toLowerCase().includes('github')) tags.add('GitHub');
  if (text.toLowerCase().includes('version')) tags.add('Version Control');
  
  return Array.from(tags);
}

// Update each project with tags
projectsData.forEach(project => {
  const tags = new Set();
  
  // Extract tags from title
  extractTags(project.title).forEach(tag => tags.add(tag));
  
  // Extract tags from problem
  if (project.problem) {
    extractTags(project.problem).forEach(tag => tags.add(tag));
  }
  
  // Extract tags from solution
  if (project.solution) {
    extractTags(project.solution).forEach(tag => tags.add(tag));
  }
  
  // Extract tags from key_features
  if (project.key_features && Array.isArray(project.key_features)) {
    project.key_features.forEach(feature => {
      extractTags(feature).forEach(tag => tags.add(tag));
    });
  }
  
  // Add category-specific tags
  if (project.category) {
    if (project.category.includes('Figma')) tags.add('Figma');
    if (project.category.includes('Chrome')) tags.add('Browser Extension');
    if (project.category.includes('VSCode')) tags.add('VSCode');
    if (project.category.includes('Notion')) tags.add('Notion');
    if (project.category.includes('Obsidian')) tags.add('Obsidian');
    if (project.category.includes('AI')) tags.add('AI');
    if (project.category.includes('Crypto')) tags.add('Crypto');
    if (project.category.includes('Zapier')) tags.add('Zapier');
    if (project.category.includes('Jasper')) tags.add('Jasper');
  }
  
  // Assign tags to project
  project.tags = Array.from(tags).sort();
});

// Save updated projects
fs.writeFileSync('./data/projects.json', JSON.stringify(projectsData, null, 2));

// Generate summary
const allTags = new Set();
projectsData.forEach(project => {
  if (project.tags) {
    project.tags.forEach(tag => allTags.add(tag));
  }
});

console.log(`Updated ${projectsData.length} projects with tags`);
console.log(`Total unique tags: ${allTags.size}`);
console.log(`\nAll tags: ${Array.from(allTags).sort().join(', ')}`);