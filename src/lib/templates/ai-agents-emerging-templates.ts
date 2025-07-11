/**
 * AI Agents and Emerging Platform Templates
 */

export const AI_AGENTS_EMERGING_TEMPLATES = {
  // LangChain Agent Template
  'langchain-agent': {
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        main: 'dist/index.js',
        scripts: {
          start: 'node dist/index.js',
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          test: 'jest',
          'test:watch': 'jest --watch',
          lint: 'eslint src/**/*.ts'
        },
        dependencies: {
          'langchain': '^0.3.0',
          '@langchain/openai': '^0.3.0',
          '@langchain/community': '^0.3.0',
          '@langchain/core': '^0.3.0',
          'zod': '^3.23.0',
          'dotenv': '^16.4.5',
          'express': '^4.21.0',
          'cors': '^2.8.5',
          'chromadb': '^1.8.0'
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/express': '^4.17.21',
          '@types/cors': '^2.8.17',
          'typescript': '^5.8.0',
          'tsx': '^4.19.0',
          'jest': '^29.7.0',
          '@types/jest': '^29.5.12',
          'eslint': '^9.0.0'
        }
      }
    },
    'src/index.ts': {
      content: `import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initializeAgent } from './agent';
import { AgentExecutor } from 'langchain/agents';

config();

const app = express();
app.use(cors());
app.use(express.json());

let agent: AgentExecutor;

// Initialize the agent
async function initialize() {
  console.log('Initializing {{PROJECT_NAME}} agent...');
  agent = await initializeAgent();
  console.log('Agent initialized successfully!');
}

// Main agent endpoint
app.post('/api/agent', async (req, res) => {
  try {
    const { input, sessionId } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }
    
    console.log(\`Processing request for session \${sessionId}: \${input}\`);
    
    const result = await agent.invoke({
      input,
      sessionId
    });
    
    res.json({
      output: result.output,
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', agent: '{{PROJECT_NAME}}' });
});

const PORT = process.env.PORT || 3000;

initialize().then(() => {
  app.listen(PORT, () => {
    console.log(\`{{PROJECT_NAME}} agent running on port \${PORT}\`);
  });
}).catch(console.error);`
    },
    'src/agent.ts': {
      content: `import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { DynamicTool } from '@langchain/core/tools';
import { BufferMemory } from 'langchain/memory';
import { searchTool, calculatorTool, webScraperTool } from './tools';

export async function initializeAgent(): Promise<AgentExecutor> {
  // Initialize the LLM
  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Define the agent's tools
  const tools = [
    searchTool,
    calculatorTool,
    webScraperTool,
    new DynamicTool({
      name: 'custom_analysis',
      description: 'Perform custom analysis on provided data',
      func: async (input: string) => {
        // Custom analysis logic here
        return \`Analysis complete: \${input}\`;
      },
    }),
  ];

  // Create the prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', \`You are {{PROJECT_NAME}}, an AI agent that {{PROJECT_DESCRIPTION}}.
    
Key capabilities:
{{FEATURES_LIST}}

Always be helpful, accurate, and provide detailed explanations when needed.\`],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  // Create the agent
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  // Create the agent executor with memory
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory: new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
    }),
    verbose: true,
  });

  return agentExecutor;
}`
    },
    'src/tools.ts': {
      content: `import { DynamicTool } from '@langchain/core/tools';
import { Calculator } from 'langchain/tools/calculator';

// Search tool for web queries
export const searchTool = new DynamicTool({
  name: 'web_search',
  description: 'Search the web for current information',
  func: async (query: string) => {
    // Implement your search logic here
    // This could use SerpAPI, Google Custom Search, etc.
    return \`Search results for: \${query}\`;
  },
});

// Calculator tool for mathematical operations
export const calculatorTool = new Calculator();

// Web scraper tool
export const webScraperTool = new DynamicTool({
  name: 'web_scraper',
  description: 'Scrape content from a given URL',
  func: async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      // Process and clean the text as needed
      return text.substring(0, 1000) + '...';
    } catch (error) {
      return \`Error scraping \${url}: \${error}\`;
    }
  },
});`
    }
  },

  // AutoGPT-style Agent Template
  'autogpt-agent': {
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        main: 'dist/index.js',
        scripts: {
          start: 'node dist/index.js',
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          test: 'jest'
        },
        dependencies: {
          'openai': '^4.67.0',
          'pinecone-client': '^1.1.0',
          'cheerio': '^1.0.0',
          'puppeteer': '^23.0.0',
          'node-fetch': '^3.3.0',
          'zod': '^3.23.0',
          'bull': '^4.16.0',
          'redis': '^4.7.0'
        }
      }
    },
    'src/agent/core.ts': {
      content: `import { OpenAI } from 'openai';
import { TaskManager } from './task-manager';
import { MemoryManager } from './memory';
import { ToolManager } from './tools';

export class AutonomousAgent {
  private openai: OpenAI;
  private taskManager: TaskManager;
  private memoryManager: MemoryManager;
  private toolManager: ToolManager;
  private maxIterations: number = 50;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.taskManager = new TaskManager();
    this.memoryManager = new MemoryManager();
    this.toolManager = new ToolManager();
  }

  async run(objective: string): Promise<void> {
    console.log(\`Starting autonomous agent with objective: \${objective}\`);
    
    // Initialize with the main objective
    await this.taskManager.addTask({
      description: objective,
      priority: 1,
      status: 'pending'
    });

    let iteration = 0;
    
    while (iteration < this.maxIterations) {
      const currentTask = await this.taskManager.getNextTask();
      
      if (!currentTask) {
        console.log('No more tasks to complete. Objective achieved!');
        break;
      }

      console.log(\`\\nIteration \${iteration + 1}: \${currentTask.description}\`);

      // Execute the task
      const result = await this.executeTask(currentTask);
      
      // Store result in memory
      await this.memoryManager.store({
        task: currentTask.description,
        result,
        timestamp: new Date()
      });

      // Reflect on the result and generate new tasks
      const newTasks = await this.reflectAndPlan(currentTask, result, objective);
      
      for (const task of newTasks) {
        await this.taskManager.addTask(task);
      }

      // Mark current task as complete
      await this.taskManager.completeTask(currentTask.id);
      
      iteration++;
    }

    console.log('\\nAgent execution complete!');
  }

  private async executeTask(task: any): Promise<string> {
    // Determine which tools to use
    const tools = await this.toolManager.selectTools(task.description);
    
    // Execute with selected tools
    const results = await Promise.all(
      tools.map(tool => tool.execute(task.description))
    );

    // Synthesize results
    const synthesis = await this.synthesizeResults(task.description, results);
    
    return synthesis;
  }

  private async reflectAndPlan(
    completedTask: any,
    result: string,
    objective: string
  ): Promise<any[]> {
    const prompt = \`
Objective: \${objective}
Completed Task: \${completedTask.description}
Result: \${result}

Based on this result, what are the next logical tasks to achieve the objective?
Generate 0-3 new tasks. Return empty array if objective is complete.
\`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    // Parse and return new tasks
    return this.parseNewTasks(response.choices[0].message.content || '');
  }

  private async synthesizeResults(task: string, results: string[]): Promise<string> {
    const prompt = \`
Task: \${task}
Results from tools:
\${results.map((r, i) => \`Tool \${i + 1}: \${r}\`).join('\\n')}

Synthesize these results into a coherent response.
\`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    return response.choices[0].message.content || '';
  }

  private parseNewTasks(content: string): any[] {
    // Parse GPT response to extract new tasks
    // Implementation depends on response format
    return [];
  }
}`
    }
  },

  // CrewAI Multi-Agent Template
  'crewai-agents': {
    'pyproject.toml': {
      content: `[tool.poetry]
name = "{{PACKAGE_NAME}}"
version = "0.1.0"
description = "{{PROJECT_DESCRIPTION}}"
authors = ["CoreVecta LLC <dev@corevecta.com>"]

[tool.poetry.dependencies]
python = "^3.10"
crewai = "^0.22.0"
langchain = "^0.1.0"
langchain-openai = "^0.0.5"
python-dotenv = "^1.0.0"
fastapi = "^0.109.0"
uvicorn = "^0.27.0"
pydantic = "^2.5.0"

[tool.poetry.dev-dependencies]
pytest = "^8.0.0"
black = "^24.0.0"
flake8 = "^7.0.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"`
    },
    'src/main.py': {
      content: `from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize the LLM
llm = ChatOpenAI(
    model="gpt-4-turbo-preview",
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Define specialized agents
researcher = Agent(
    role='Senior Research Analyst',
    goal='Conduct thorough research and analysis on given topics',
    backstory="""You are an expert researcher with years of experience in 
    gathering and analyzing information from various sources. You excel at 
    finding relevant data and presenting it in a clear, structured manner.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

writer = Agent(
    role='Content Writer',
    goal='Create compelling and informative content based on research',
    backstory="""You are a skilled writer who transforms research findings 
    into engaging, well-structured content. You have a talent for making 
    complex topics accessible to various audiences.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

reviewer = Agent(
    role='Quality Assurance Specialist',
    goal='Review and improve content quality',
    backstory="""You are a meticulous reviewer who ensures all content meets 
    the highest standards of accuracy, clarity, and engagement. You provide 
    constructive feedback and suggestions for improvement.""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def create_crew(topic: str):
    """Create a crew for processing a specific topic."""
    
    # Define tasks
    research_task = Task(
        description=f"""Conduct comprehensive research on: {topic}
        
        Your research should include:
        1. Key concepts and definitions
        2. Current trends and developments
        3. Important statistics and data
        4. Expert opinions and insights
        5. Potential challenges and opportunities
        
        Provide a detailed research report with sources.""",
        agent=researcher,
        expected_output="A comprehensive research report with key findings and sources"
    )
    
    writing_task = Task(
        description=f"""Based on the research provided, create engaging content about: {topic}
        
        The content should:
        1. Have a compelling introduction
        2. Be well-structured with clear sections
        3. Include relevant examples and case studies
        4. Maintain an appropriate tone for the target audience
        5. End with actionable insights or conclusions
        
        Format the content for maximum readability.""",
        agent=writer,
        expected_output="Well-written, engaging content ready for publication"
    )
    
    review_task = Task(
        description="""Review the written content for:
        
        1. Accuracy of information
        2. Clarity and readability
        3. Grammar and style
        4. Logical flow and structure
        5. Engagement and value to readers
        
        Provide specific feedback and an improved version if needed.""",
        agent=reviewer,
        expected_output="Final polished content with quality assurance report"
    )
    
    # Create the crew
    crew = Crew(
        agents=[researcher, writer, reviewer],
        tasks=[research_task, writing_task, review_task],
        process=Process.sequential,
        verbose=True
    )
    
    return crew

def process_request(topic: str):
    """Process a request using the multi-agent crew."""
    print(f"\\n🚀 Starting CrewAI agents for topic: {topic}\\n")
    
    crew = create_crew(topic)
    result = crew.kickoff()
    
    return result

if __name__ == "__main__":
    # Example usage
    topic = "{{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}"
    result = process_request(topic)
    print(f"\\n✅ Final Result:\\n{result}")`
    }
  },

  // n8n Workflow Template
  'n8n-workflow': {
    'workflow.json': {
      content: {
        name: '{{PROJECT_NAME}}',
        nodes: [
          {
            parameters: {
              notice: '{{PROJECT_DESCRIPTION}}'
            },
            id: 'a1b2c3d4-1234-5678-90ab-cdef12345678',
            name: 'Workflow Info',
            type: 'n8n-nodes-base.stickyNote',
            typeVersion: 1,
            position: [250, 250]
          },
          {
            parameters: {
              triggerTimes: {
                item: [{
                  mode: 'everyMinute'
                }]
              }
            },
            id: 'b2c3d4e5-2345-6789-01bc-def123456789',
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1.1,
            position: [250, 400]
          },
          {
            parameters: {
              url: '={{$env["WEBHOOK_URL"]}}',
              method: 'POST',
              sendBody: true,
              bodyParameters: {
                parameters: [{
                  name: 'timestamp',
                  value: '={{$now}}'
                }, {
                  name: 'workflow',
                  value: '{{PROJECT_NAME}}'
                }]
              }
            },
            id: 'c3d4e5f6-3456-7890-12cd-ef1234567890',
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position: [450, 400]
          },
          {
            parameters: {
              functionCode: `// {{PROJECT_NAME}} - Custom processing logic
const items = $input.all();

return items.map(item => {
  // Your custom logic here
  const processed = {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString(),
    features: {{FEATURES_LIST}}
  };
  
  return {
    json: processed
  };
});`
            },
            id: 'd4e5f6g7-4567-8901-23de-f12345678901',
            name: 'Process Data',
            type: 'n8n-nodes-base.function',
            typeVersion: 1,
            position: [650, 400]
          }
        ],
        connections: {
          'Schedule Trigger': {
            main: [[{
              node: 'HTTP Request',
              type: 'main',
              index: 0
            }]]
          },
          'HTTP Request': {
            main: [[{
              node: 'Process Data',
              type: 'main',
              index: 0
            }]]
          }
        },
        settings: {
          executionOrder: 'v1'
        },
        staticData: null,
        meta: {
          instanceId: '{{PACKAGE_NAME}}'
        },
        tags: []
      }
    },
    'README.md': {
      content: `# {{PROJECT_NAME}} - n8n Workflow

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## Installation

### Option 1: Import via n8n UI
1. Copy the contents of \`workflow.json\`
2. In n8n, go to Workflows → Add Workflow → Import from JSON
3. Paste the JSON and click Import

### Option 2: Use n8n CLI
\`\`\`bash
n8n import:workflow --input=workflow.json
\`\`\`

## Configuration

### Environment Variables
- \`WEBHOOK_URL\`: The webhook endpoint for external integrations
- \`API_KEY\`: Your API key for authenticated requests

### Credentials
This workflow requires the following credentials:
1. HTTP Request node: API credentials (if needed)
2. Database node: Connection credentials (if used)

## Usage

1. Configure the schedule trigger for your needs
2. Update the HTTP request URL and parameters
3. Customize the processing logic in the Function node
4. Activate the workflow

## Extending the Workflow

### Adding Integrations
- Slack: Add a Slack node to send notifications
- Email: Use the Email node for alerts
- Database: Store results using PostgreSQL/MySQL nodes
- AI: Integrate with OpenAI for intelligent processing

### Error Handling
Add an Error Trigger node to handle failures gracefully

## Support

Created by CoreVecta LLC
Part of the Masterlist platform`
    }
  },

  // Zapier Integration Template (Enhanced)
  'zapier-integration': {
    'index.js': {
      content: `const authentication = require('./authentication');
const triggers = require('./triggers');
const actions = require('./actions');
const searches = require('./searches');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  
  authentication: authentication,
  
  triggers: {
    ...triggers
  },
  
  creates: {
    ...actions
  },
  
  searches: {
    ...searches
  },
  
  resources: {
    // Define resources here if needed
  },
  
  // If you want Zapier to get hydrated objects
  hydrators: {
    getFullRecord: (z, bundle) => {
      const response = z.request({
        url: \`\${bundle.authData.apiUrl}/api/records/\${bundle.inputData.id}\`,
      });
      return response.then((res) => res.json);
    }
  },
  
  beforeRequest: [
    (request, z, bundle) => {
      request.headers['X-API-Key'] = bundle.authData.apiKey;
      request.headers['Content-Type'] = 'application/json';
      return request;
    }
  ],
  
  afterResponse: [
    (response, z, bundle) => {
      if (response.status >= 400) {
        throw new z.errors.ResponseError(
          \`Unexpected status code \${response.status}\`,
          response
        );
      }
      return response;
    }
  ]
};`
    },
    'triggers/new-item.js': {
      content: `module.exports = {
  key: 'new_item',
  noun: 'Item',
  display: {
    label: 'New Item',
    description: 'Triggers when a new item is created in {{PROJECT_NAME}}'
  },
  
  operation: {
    inputFields: [
      {
        key: 'category',
        label: 'Category',
        type: 'string',
        helpText: 'Filter by category (optional)',
        dynamic: 'categories.id.name'
      }
    ],
    
    perform: async (z, bundle) => {
      const response = await z.request({
        url: \`\${bundle.authData.apiUrl}/api/items\`,
        params: {
          category: bundle.inputData.category,
          since: bundle.meta.isLoadingSample ? null : bundle.meta.page
        }
      });
      
      return response.json;
    },
    
    sample: {
      id: '123',
      title: 'Sample Item',
      description: 'This is a sample item from {{PROJECT_NAME}}',
      category: 'general',
      created_at: new Date().toISOString()
    },
    
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'created_at', label: 'Created At', type: 'datetime' }
    ]
  }
};`
    }
  },

  // Make.com (Integromat) Scenario Template
  'make-scenario': {
    'blueprint.json': {
      content: {
        name: '{{PROJECT_NAME}}',
        flow: [
          {
            id: 1,
            module: 'gateway:CustomWebHook',
            version: 1,
            parameters: {
              hook: {
                label: '{{PROJECT_NAME}} Webhook'
              }
            },
            mapper: {},
            metadata: {
              designer: {
                x: 0,
                y: 0
              }
            }
          },
          {
            id: 2,
            module: 'util:FunctionRouter',
            version: 1,
            parameters: {
              conditions: [[{
                a: '{{1.event_type}}',
                b: 'process',
                o: 'text:equal'
              }]]
            },
            mapper: {},
            metadata: {
              designer: {
                x: 300,
                y: 0
              }
            }
          },
          {
            id: 3,
            module: 'http:ActionSendData',
            version: 1,
            parameters: {
              handleErrors: false,
              useNewZapatier: false
            },
            mapper: {
              url: 'https://api.{{PACKAGE_NAME}}.com/process',
              method: 'POST',
              headers: [{
                name: 'Content-Type',
                value: 'application/json'
              }],
              qs: [],
              bodyType: 'raw',
              parseResponses: true,
              timeout: '30',
              shareCookies: false,
              ca: '',
              rejectUnauthorized: true,
              followRedirect: true,
              useQuerystring: false,
              gzip: true,
              useMtls: false,
              contentType: 'application/json',
              data: '{{toJSON(1)}}'
            },
            metadata: {
              designer: {
                x: 600,
                y: 0
              }
            }
          }
        ],
        metadata: {
          instant: false,
          version: 1,
          scenario: {
            roundtrips: 1,
            maxErrors: 3,
            autoCommit: false,
            sequential: false,
            confidential: false,
            dataloss: false,
            dlq: false
          },
          designer: {
            orphans: []
          },
          zone: 'us1.make.com'
        }
      }
    },
    'README.md': {
      content: `# {{PROJECT_NAME}} - Make.com Integration

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## Setup Instructions

1. Import the blueprint.json into Make.com
2. Configure the webhook URL
3. Set up authentication
4. Map the data fields
5. Activate the scenario

## Configuration

### Webhook Setup
1. Create a new webhook in Make.com
2. Copy the webhook URL
3. Configure your application to send data to this URL

### Authentication
- API Key: Required for external API calls
- OAuth2: For user-specific integrations

## Usage Examples

### Basic Processing
Sends incoming webhook data to processing API

### Advanced Routing
Use routers to handle different event types

### Error Handling
Configure error handlers for resilient workflows

## Support

Created by CoreVecta LLC`
    }
  },

  // Retool App Template
  'retool-app': {
    'app.json': {
      content: {
        version: '3.0.0',
        appId: '{{PACKAGE_NAME}}',
        appName: '{{PROJECT_NAME}}',
        appDescription: '{{PROJECT_DESCRIPTION}}',
        pages: [{
          id: 'main',
          name: 'Main Dashboard',
          components: [
            {
              id: 'title1',
              type: 'text',
              properties: {
                value: '# {{PROJECT_NAME}}',
                markdown: true
              },
              position: { x: 0, y: 0, w: 12, h: 1 }
            },
            {
              id: 'table1',
              type: 'table',
              properties: {
                data: '{{ query1.data }}',
                columns: [
                  { Header: 'ID', accessor: 'id' },
                  { Header: 'Title', accessor: 'title' },
                  { Header: 'Status', accessor: 'status' },
                  { Header: 'Created', accessor: 'created_at' }
                ]
              },
              position: { x: 0, y: 1, w: 8, h: 6 }
            },
            {
              id: 'form1',
              type: 'form',
              properties: {
                submit: {
                  label: 'Create New',
                  action: '{{ createItem.trigger() }}'
                }
              },
              position: { x: 8, y: 1, w: 4, h: 6 }
            }
          ]
        }],
        queries: [
          {
            id: 'query1',
            type: 'restapi',
            resourceName: 'api',
            runWhenPageLoads: true,
            query: {
              method: 'GET',
              url: '/items'
            }
          },
          {
            id: 'createItem',
            type: 'restapi',
            resourceName: 'api',
            query: {
              method: 'POST',
              url: '/items',
              body: '{{ form1.data }}'
            },
            onSuccess: ['query1.trigger()']
          }
        ],
        resources: [
          {
            id: 'api',
            type: 'restapi',
            baseUrl: 'https://api.{{PACKAGE_NAME}}.com',
            headers: {
              'Authorization': 'Bearer {{ current_user.metadata.api_key }}'
            }
          }
        ]
      }
    }
  }
};