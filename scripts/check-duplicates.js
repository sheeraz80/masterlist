const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'data', 'projects.json');
const data = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

const ids = data.map(p => p.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const uniqueDuplicates = [...new Set(duplicates)];

console.log('Total projects:', data.length);
console.log('Unique IDs:', new Set(ids).size);
console.log('Duplicate IDs:', uniqueDuplicates);

// Find projects with duplicate IDs
uniqueDuplicates.forEach(id => {
  const projects = data.filter(p => p.id === id);
  console.log(`\nID ${id} appears ${projects.length} times:`);
  projects.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title} (${p.category})`);
  });
});

// Fix duplicates by making IDs unique
const fixedData = data.map((project, index) => ({
  ...project,
  id: (index + 1).toString()
}));

// Write fixed data
const outputPath = path.join(__dirname, '..', 'data', 'projects-fixed.json');
fs.writeFileSync(outputPath, JSON.stringify(fixedData, null, 2));

console.log(`\nFixed data written to: ${outputPath}`);
console.log(`Fixed projects: ${fixedData.length}`);
console.log(`All IDs now unique: ${new Set(fixedData.map(p => p.id)).size === fixedData.length}`);