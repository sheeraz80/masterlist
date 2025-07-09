const fs = require('fs');
const path = require('path');

function parseMasterlist() {
  const masterlistPath = path.join(__dirname, '..', 'masterlist.txt');
  const outputPath = path.join(__dirname, '..', 'data', 'projects.json');
  
  const content = fs.readFileSync(masterlistPath, 'utf-8');
  const lines = content.split('\n');
  
  const projects = [];
  let currentProject = null;
  let currentPlatform = '';
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Detect platform
    if (line.startsWith('PLATFORM:')) {
      currentPlatform = line.replace('PLATFORM:', '').trim();
      continue;
    }
    
    // Detect new project
    if (line.match(/^PROJECT \d+:/)) {
      // Save previous project
      if (currentProject) {
        projects.push(currentProject);
      }
      
      // Start new project
      const projectMatch = line.match(/^PROJECT (\d+): (.+)$/);
      if (projectMatch) {
        currentProject = {
          id: projectMatch[1],
          title: projectMatch[2],
          platform: currentPlatform,
          category: mapPlatformToCategory(currentPlatform),
          problem: '',
          solution: '',
          target_users: '',
          revenue_model: '',
          revenue_potential: {
            conservative: 0,
            realistic: 0,
            optimistic: 0
          },
          development_time: '',
          competition_level: '',
          technical_complexity: 0,
          quality_score: 0,
          key_features: [],
          monetization_details: '',
          risk_assessment: '',
          success_indicators: []
        };
      }
      continue;
    }
    
    // Parse project fields
    if (currentProject) {
      if (line.startsWith('Problem:')) {
        currentProject.problem = line.replace('Problem:', '').trim();
        currentSection = 'problem';
      } else if (line.startsWith('Solution:')) {
        currentProject.solution = line.replace('Solution:', '').trim();
        currentSection = 'solution';
      } else if (line.startsWith('Target Users:')) {
        currentProject.target_users = line.replace('Target Users:', '').trim();
        currentSection = 'target_users';
      } else if (line.startsWith('Revenue Model:')) {
        currentProject.revenue_model = line.replace('Revenue Model:', '').trim();
        currentSection = 'revenue_model';
      } else if (line.startsWith('Revenue Potential:')) {
        const revenueText = line.replace('Revenue Potential:', '').trim();
        parseRevenuePotential(revenueText, currentProject);
        currentSection = 'revenue_potential';
      } else if (line.startsWith('Development Time:')) {
        currentProject.development_time = line.replace('Development Time:', '').trim();
        currentSection = 'development_time';
      } else if (line.startsWith('Competition Level:')) {
        currentProject.competition_level = line.replace('Competition Level:', '').trim();
        currentSection = 'competition_level';
      } else if (line.startsWith('Technical Complexity:')) {
        const complexityText = line.replace('Technical Complexity:', '').trim();
        const complexityMatch = complexityText.match(/(\d+)\/10/);
        if (complexityMatch) {
          currentProject.technical_complexity = parseInt(complexityMatch[1]);
        }
        currentSection = 'technical_complexity';
      } else if (line.startsWith('Key Features:')) {
        currentSection = 'key_features';
      } else if (line.startsWith('Monetization Details:')) {
        currentProject.monetization_details = line.replace('Monetization Details:', '').trim();
        currentSection = 'monetization_details';
      } else if (line.startsWith('Risk Assessment:')) {
        currentProject.risk_assessment = line.replace('Risk Assessment:', '').trim();
        currentSection = 'risk_assessment';
      } else if (line.startsWith('Success Indicators:')) {
        currentSection = 'success_indicators';
      } else {
        // Handle continuation lines and key features
        if (currentSection === 'key_features' && !line.startsWith('PROJECT') && !line.startsWith('Monetization')) {
          if (line.length > 0) {
            currentProject.key_features.push(line);
          }
        } else if (currentSection === 'success_indicators' && !line.startsWith('PROJECT')) {
          if (line.length > 0) {
            currentProject.success_indicators.push(line);
          }
        } else if (currentSection === 'problem' && !line.startsWith('Solution:') && !line.startsWith('TARGET')) {
          currentProject.problem += ' ' + line;
        } else if (currentSection === 'solution' && !line.startsWith('Target Users:') && !line.startsWith('Revenue')) {
          currentProject.solution += ' ' + line;
        } else if (currentSection === 'monetization_details' && !line.startsWith('Risk Assessment:') && !line.startsWith('PROJECT')) {
          currentProject.monetization_details += ' ' + line;
        } else if (currentSection === 'risk_assessment' && !line.startsWith('Success Indicators:') && !line.startsWith('PROJECT')) {
          currentProject.risk_assessment += ' ' + line;
        }
      }
    }
  }
  
  // Add the last project
  if (currentProject) {
    projects.push(currentProject);
  }
  
  // Calculate quality scores based on multiple factors
  projects.forEach(project => {
    project.quality_score = calculateQualityScore(project);
  });
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2));
  
  console.log(`Successfully parsed ${projects.length} projects from masterlist.txt`);
  console.log(`Output written to: ${outputPath}`);
  
  return projects;
}

function mapPlatformToCategory(platform) {
  const platformMappings = {
    'Figma Plugins': 'Figma Plugin',
    'Chrome Extensions': 'Chrome Extension',
    'AI Browser Tools': 'AI Browser Tools',
    'AI Productivity Tools': 'AI Productivity Tools',
    'Crypto Browser Tools': 'Crypto Browser Tools',
    'VSCode Extensions': 'VSCode Extension',
    'Obsidian Plugins': 'Obsidian Plugin',
    'Notion Templates': 'Notion Templates',
    'Zapier AI Apps': 'Zapier AI Apps',
    'Jasper Canvas': 'Jasper Canvas'
  };
  
  return platformMappings[platform] || platform || 'Other';
}

function parseRevenuePotential(text, project) {
  // Extract revenue numbers from text like "Conservative: ~$800/month; Realistic: ~$3,000/month; Optimistic: ~$8,000/month"
  const conservativeMatch = text.match(/Conservative[:\s~$]*([0-9,]+)/i);
  const realisticMatch = text.match(/Realistic[:\s~$]*([0-9,]+)/i);
  const optimisticMatch = text.match(/Optimistic[:\s~$]*([0-9,]+)/i);
  
  if (conservativeMatch) {
    project.revenue_potential.conservative = parseInt(conservativeMatch[1].replace(/,/g, ''));
  }
  if (realisticMatch) {
    project.revenue_potential.realistic = parseInt(realisticMatch[1].replace(/,/g, ''));
  }
  if (optimisticMatch) {
    project.revenue_potential.optimistic = parseInt(optimisticMatch[1].replace(/,/g, ''));
  }
}

function calculateQualityScore(project) {
  let score = 0;
  
  // Revenue potential (0-3 points)
  const realisticRevenue = project.revenue_potential.realistic;
  if (realisticRevenue > 10000) score += 3;
  else if (realisticRevenue > 5000) score += 2;
  else if (realisticRevenue > 1000) score += 1;
  
  // Technical complexity (0-2 points, inverse - lower complexity = higher score)
  if (project.technical_complexity <= 3) score += 2;
  else if (project.technical_complexity <= 6) score += 1;
  
  // Competition level (0-2 points)
  const competitionText = project.competition_level.toLowerCase();
  if (competitionText.includes('low')) score += 2;
  else if (competitionText.includes('medium')) score += 1;
  
  // Feature richness (0-2 points)
  if (project.key_features.length > 5) score += 2;
  else if (project.key_features.length > 3) score += 1;
  
  // Content quality (0-1 point)
  if (project.problem.length > 100 && project.solution.length > 100) score += 1;
  
  // Convert to 10-point scale
  return Math.min(10, (score / 10) * 10);
}

// Run the parser
if (require.main === module) {
  parseMasterlist();
}

module.exports = { parseMasterlist };