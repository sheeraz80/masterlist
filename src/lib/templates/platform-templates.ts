/**
 * Platform-specific template files for all project types
 */

export const PLATFORM_TEMPLATES = {
  // ===== FIGMA PLUGIN TEMPLATE =====
  'figma-plugin': {
    'manifest.json': {
      content: JSON.stringify({
        "name": "{{PROJECT_NAME}}",
        "id": "{{PACKAGE_NAME}}",
        "api": "1.0.0",
        "main": "code.js",
        "ui": "ui.html",
        "editorType": ["figma", "figjam"],
        "permissions": [],
        "networkAccess": {
          "allowedDomains": ["*"]
        }
      }, null, 2)
    },
    'package.json': {
      content: JSON.stringify({
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "code.js",
        "scripts": {
          "build": "tsc -p tsconfig.json",
          "watch": "tsc -p tsconfig.json --watch",
          "dev": "npm run watch",
          "lint": "eslint src/**/*.ts"
        },
        "devDependencies": {
          "@figma/plugin-typings": "^1.82.0",
          "@types/node": "^20.0.0",
          "typescript": "^5.0.0",
          "eslint": "^8.0.0",
          "@typescript-eslint/eslint-plugin": "^6.0.0",
          "@typescript-eslint/parser": "^6.0.0"
        }
      }, null, 2)
    },
    'tsconfig.json': {
      content: JSON.stringify({
        "compilerOptions": {
          "target": "es2020",
          "module": "es2020",
          "lib": ["es2020"],
          "strict": true,
          "typeRoots": ["./node_modules/@types", "./node_modules/@figma"],
          "moduleResolution": "node",
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true
        },
        "include": ["src/**/*.ts"],
        "exclude": ["node_modules"]
      }, null, 2)
    },
    'src/code.ts': {
      content: `// This plugin will help with {{PROJECT_NAME}}
// {{PROJECT_DESCRIPTION}}

figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-shapes') {
    const nodes = [];
    
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
`
    },
    'src/ui.html': {
      content: `<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 20px;
  }
  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  button {
    background: #0066ff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
  button:hover {
    background: #0052cc;
  }
  .secondary {
    background: #f0f0f0;
    color: #333;
  }
  .secondary:hover {
    background: #e0e0e0;
  }
</style>

<h1>{{PROJECT_NAME}}</h1>
<p>{{PROJECT_DESCRIPTION}}</p>

<div id="controls">
  <button id="create">Create</button>
  <button id="cancel" class="secondary">Cancel</button>
</div>

<script>
document.getElementById('create').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'create-shapes', count: 5 } }, '*');
};

document.getElementById('cancel').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
};
</script>
`
    },
    '.gitignore': {
      content: `node_modules/
*.log
.DS_Store
code.js
*.fig
.vscode/`
    },
    'README.md': {
      content: `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build the plugin:
   \`\`\`bash
   npm run build
   \`\`\`

3. In Figma, go to Plugins → Development → Import plugin from manifest
4. Select the \`manifest.json\` file

## Usage

1. Run the plugin from Plugins → Development → {{PROJECT_NAME}}
2. Use the plugin UI to interact with your Figma document

## Features

{{FEATURES_LIST}}
`
    }
  },

  // ===== OBSIDIAN PLUGIN TEMPLATE =====
  'obsidian-plugin': {
    'manifest.json': {
      content: JSON.stringify({
        "id": "{{PACKAGE_NAME}}",
        "name": "{{PROJECT_NAME}}",
        "version": "0.1.0",
        "minAppVersion": "1.0.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "author": "CoreVecta",
        "authorUrl": "https://corevecta.com",
        "isDesktopOnly": false
      }, null, 2)
    },
    'package.json': {
      content: JSON.stringify({
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "main.js",
        "scripts": {
          "dev": "node esbuild.config.mjs",
          "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
          "version": "node version-bump.mjs && git add manifest.json versions.json"
        },
        "keywords": ["obsidian", "plugin"],
        "devDependencies": {
          "@types/node": "^20.0.0",
          "@typescript-eslint/eslint-plugin": "^6.0.0",
          "@typescript-eslint/parser": "^6.0.0",
          "builtin-modules": "^3.3.0",
          "esbuild": "0.19.10",
          "obsidian": "latest",
          "tslib": "2.6.2",
          "typescript": "5.3.3"
        }
      }, null, 2)
    },
    'src/main.ts': {
      content: `import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';

interface {{PROJECT_NAME}}Settings {
  setting1: string;
  setting2: boolean;
}

const DEFAULT_SETTINGS: {{PROJECT_NAME}}Settings = {
  setting1: 'default',
  setting2: true
}

export default class {{PROJECT_NAME}}Plugin extends Plugin {
  settings: {{PROJECT_NAME}}Settings;

  async onload() {
    await this.loadSettings();

    // This creates an icon in the left ribbon
    const ribbonIconEl = this.addRibbonIcon('dice', '{{PROJECT_NAME}}', (evt: MouseEvent) => {
      new Notice('{{PROJECT_NAME}} is running!');
    });

    // This adds a status bar item
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('{{PROJECT_NAME}} Ready');

    // This adds a simple command
    this.addCommand({
      id: 'sample-command',
      name: 'Sample Command',
      callback: () => {
        new Notice('Command executed!');
      }
    });

    // This adds a settings tab
    this.addSettingTab(new {{PROJECT_NAME}}SettingTab(this.app, this));
  }

  onunload() {
    console.log('Unloading {{PROJECT_NAME}}');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class {{PROJECT_NAME}}SettingTab extends PluginSettingTab {
  plugin: {{PROJECT_NAME}}Plugin;

  constructor(app: App, plugin: {{PROJECT_NAME}}Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;
    containerEl.empty();
    
    containerEl.createEl('h2', {text: '{{PROJECT_NAME}} Settings'});

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('Description for setting #1')
      .addText(text => text
        .setPlaceholder('Enter your setting')
        .setValue(this.plugin.settings.setting1)
        .onChange(async (value) => {
          this.plugin.settings.setting1 = value;
          await this.plugin.saveSettings();
        }));
  }
}
`
    },
    'esbuild.config.mjs': {
      content: `import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = \`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
\`;

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
  banner: {
    js: banner,
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
`
    },
    'styles.css': {
      content: `/* {{PROJECT_NAME}} Custom Styles */

.{{PACKAGE_NAME}}-container {
  padding: 10px;
  background-color: var(--background-primary);
  border-radius: 5px;
}

.{{PACKAGE_NAME}}-button {
  background-color: var(--interactive-accent);
  color: var(--text-on-accent);
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.{{PACKAGE_NAME}}-button:hover {
  background-color: var(--interactive-accent-hover);
}
`
    },
    'tsconfig.json': {
      content: JSON.stringify({
        "compilerOptions": {
          "baseUrl": ".",
          "inlineSourceMap": true,
          "inlineSources": true,
          "module": "ESNext",
          "target": "ES6",
          "allowJs": true,
          "noImplicitAny": true,
          "moduleResolution": "node",
          "importHelpers": true,
          "isolatedModules": true,
          "strictNullChecks": true,
          "lib": ["DOM", "ES5", "ES6", "ES7"]
        },
        "include": ["**/*.ts"]
      }, null, 2)
    }
  },

  // ===== ZAPIER APP TEMPLATE =====
  'zapier-app': {
    'package.json': {
      content: JSON.stringify({
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "index.js",
        "scripts": {
          "test": "jest --testTimeout 10000",
          "push": "zapier push",
          "validate": "zapier validate",
          "promote": "zapier promote",
          "deploy": "npm run validate && npm run push"
        },
        "engines": {
          "node": ">=18",
          "npm": ">=9"
        },
        "dependencies": {
          "zapier-platform-core": "15.5.0"
        },
        "devDependencies": {
          "jest": "^29.0.0",
          "zapier-platform-cli": "15.5.0"
        }
      }, null, 2)
    },
    'index.js': {
      content: `const authentication = require('./authentication');
const triggers = require('./triggers');
const actions = require('./actions');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  triggers: {
    ...triggers,
  },

  actions: {
    ...actions,
  },

  resources: {},
};
`
    },
    'authentication.js': {
      content: `module.exports = {
  type: 'custom',
  test: {
    url: 'https://api.example.com/me',
  },
  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      type: 'string',
      required: true,
      helpText: 'Found in your account settings',
    },
  ],
  connectionLabel: '{{email}}',
};
`
    },
    'triggers/index.js': {
      content: `module.exports = {
  new_item: require('./new_item'),
};
`
    },
    'triggers/new_item.js': {
      content: `module.exports = {
  key: 'new_item',
  noun: 'Item',
  display: {
    label: 'New Item',
    description: 'Triggers when a new item is created.',
  },
  operation: {
    perform: async (z, bundle) => {
      const response = await z.request({
        url: 'https://api.example.com/items',
        params: {
          since: bundle.meta.page ? bundle.meta.page : 0,
        },
      });
      return response.data;
    },
    sample: {
      id: 1,
      name: 'Sample Item',
      created_at: new Date().toISOString(),
    },
  },
};
`
    },
    'actions/index.js': {
      content: `module.exports = {
  create_item: require('./create_item'),
};
`
    },
    'actions/create_item.js': {
      content: `module.exports = {
  key: 'create_item',
  noun: 'Item',
  display: {
    label: 'Create Item',
    description: 'Creates a new item.',
  },
  operation: {
    inputFields: [
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        required: true,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
      },
    ],
    perform: async (z, bundle) => {
      const response = await z.request({
        method: 'POST',
        url: 'https://api.example.com/items',
        body: {
          name: bundle.inputData.name,
          description: bundle.inputData.description,
        },
      });
      return response.data;
    },
    sample: {
      id: 1,
      name: 'Sample Item',
      description: 'A sample item',
      created_at: new Date().toISOString(),
    },
  },
};
`
    },
    '.zapierapprc': {
      content: JSON.stringify({
        "id": null,
        "key": null
      }, null, 2)
    },
    '.gitignore': {
      content: `node_modules/
*.log
.env
build/
.zapierapprc`
    }
  },

  // ===== NOTION INTEGRATION TEMPLATE =====
  'notion-integration': {
    'package.json': {
      content: JSON.stringify({
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
        "dependencies": {
          "@notionhq/client": "^2.2.14",
          "next": "14.1.0",
          "react": "18.2.0",
          "react-dom": "18.2.0",
          "@radix-ui/react-dialog": "^1.0.5",
          "@radix-ui/react-select": "^2.0.0",
          "tailwindcss": "^3.4.0",
          "typescript": "^5.3.0"
        },
        "devDependencies": {
          "@types/node": "^20.0.0",
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "autoprefixer": "^10.4.0",
          "postcss": "^8.4.0",
          "eslint": "^8.0.0",
          "eslint-config-next": "14.1.0"
        }
      }, null, 2)
    },
    'app/page.tsx': {
      content: `import NotionSync from '@/components/notion-sync';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">{{PROJECT_NAME}}</h1>
        <p className="text-center text-gray-600 mb-12">{{PROJECT_DESCRIPTION}}</p>
        <NotionSync />
      </div>
    </main>
  );
}
`
    },
    'app/api/notion/route.ts': {
      content: `import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    const databases = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    return NextResponse.json({ databases: databases.results });
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await notion.pages.create({
      parent: { database_id: body.databaseId },
      properties: body.properties,
    });

    return NextResponse.json({ page: response });
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
`
    },
    'components/notion-sync.tsx': {
      content: `'use client';

import { useState, useEffect } from 'react';

export default function NotionSync() {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await fetch('/api/notion');
      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (error) {
      console.error('Error fetching databases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Notion Databases</h2>
        {databases.length === 0 ? (
          <p className="text-gray-500">No databases found. Make sure your integration has access to your Notion workspace.</p>
        ) : (
          <ul className="space-y-2">
            {databases.map((db: any) => (
              <li key={db.id} className="p-3 border rounded hover:bg-gray-50">
                {db.title?.[0]?.plain_text || 'Untitled Database'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
`
    },
    '.env.example': {
      content: `# Get your Notion API key from https://www.notion.so/my-integrations
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`
    },
    'next.config.js': {
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`
    },
    'tailwind.config.js': {
      content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
    }
  },

  // ===== AI WEB APP TEMPLATE =====
  'ai-web-app': {
    'package.json': {
      content: JSON.stringify({
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
        "dependencies": {
          "next": "14.1.0",
          "react": "18.2.0",
          "react-dom": "18.2.0",
          "openai": "^4.26.0",
          "@vercel/ai": "^2.2.0",
          "tailwindcss": "^3.4.0",
          "typescript": "^5.3.0",
          "@radix-ui/react-dialog": "^1.0.5",
          "@radix-ui/react-select": "^2.0.0",
          "lucide-react": "^0.312.0",
          "clsx": "^2.1.0"
        },
        "devDependencies": {
          "@types/node": "^20.0.0",
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "autoprefixer": "^10.4.0",
          "postcss": "^8.4.0",
          "eslint": "^8.0.0",
          "eslint-config-next": "14.1.0"
        }
      }, null, 2)
    },
    'app/page.tsx': {
      content: `import AIChat from '@/components/ai-chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{{PROJECT_NAME}}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{{PROJECT_DESCRIPTION}}</p>
        </div>
        <AIChat />
      </div>
    </main>
  );
}
`
    },
    'app/api/ai/route.ts': {
      content: `import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for {{PROJECT_NAME}}. {{PROJECT_DESCRIPTION}}',
        },
        ...messages,
      ],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('AI API error:', error);
    return new Response('An error occurred', { status: 500 });
  }
}
`
    },
    'components/ai-chat.tsx': {
      content: `'use client';

import { useChat } from 'ai/react';
import { Send, Loader2 } from 'lucide-react';

export default function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-[600px] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg">Welcome! How can I help you today?</p>
              <p className="text-sm mt-2">Start by typing a message below.</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={\`flex \${message.role === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div
                className={\`max-w-[80%] rounded-lg px-4 py-2 \${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }\`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`
    },
    '.env.example': {
      content: `# Get your OpenAI API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`
    }
  },

  // ===== AI BACKEND API TEMPLATE =====
  'ai-backend-api': {
    'package.json': {
      content: JSON.stringify({
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "dist/server.js",
        "scripts": {
          "dev": "tsx watch src/server.ts",
          "build": "tsc",
          "start": "node dist/server.js",
          "test": "jest",
          "lint": "eslint src/**/*.ts"
        },
        "dependencies": {
          "express": "^4.18.0",
          "cors": "^2.8.5",
          "dotenv": "^16.0.0",
          "openai": "^4.26.0",
          "zod": "^3.22.0",
          "express-rate-limit": "^7.1.0",
          "helmet": "^7.1.0",
          "winston": "^3.11.0",
          "pg": "^8.11.0",
          "redis": "^4.6.0"
        },
        "devDependencies": {
          "@types/express": "^4.17.0",
          "@types/cors": "^2.8.0",
          "@types/node": "^20.0.0",
          "@types/pg": "^8.10.0",
          "typescript": "^5.3.0",
          "tsx": "^4.7.0",
          "jest": "^29.0.0",
          "@types/jest": "^29.0.0",
          "eslint": "^8.0.0",
          "@typescript-eslint/eslint-plugin": "^6.0.0",
          "@typescript-eslint/parser": "^6.0.0"
        }
      }, null, 2)
    },
    'src/server.ts': {
      content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { aiRouter } from './routes/ai';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());

// Routes
app.use('/api/ai', aiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
});
`
    },
    'src/routes/ai.ts': {
      content: `import { Router } from 'express';
import { z } from 'zod';
import { openai } from '../lib/openai';
import { validateRequest } from '../middleware/validate';
import { logger } from '../utils/logger';

const router = Router();

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string().optional().default('gpt-4-turbo-preview'),
});

router.post('/chat', validateRequest(chatSchema), async (req, res, next) => {
  try {
    const { messages, model } = req.body;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for {{PROJECT_NAME}}. {{PROJECT_DESCRIPTION}}',
        },
        ...messages,
      ],
    });

    res.json({
      message: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error) {
    logger.error('AI chat error:', error);
    next(error);
  }
});

router.post('/analyze', validateRequest(z.object({
  text: z.string().min(1),
  type: z.enum(['sentiment', 'summary', 'extraction']),
})), async (req, res, next) => {
  try {
    const { text, type } = req.body;

    const prompts = {
      sentiment: 'Analyze the sentiment of the following text and return positive, negative, or neutral:',
      summary: 'Summarize the following text in 2-3 sentences:',
      extraction: 'Extract key information from the following text:',
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: prompts[type],
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    res.json({
      result: completion.choices[0].message.content,
      type,
    });
  } catch (error) {
    logger.error('AI analysis error:', error);
    next(error);
  }
});

export { router as aiRouter };
`
    },
    'src/lib/openai.ts': {
      content: `import { OpenAI } from 'openai';
import { logger } from '../utils/logger';

if (!process.env.OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY is not set');
  throw new Error('OPENAI_API_KEY is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
`
    },
    'src/middleware/validate.ts': {
      content: `import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateRequest(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}
`
    },
    'src/middleware/error-handler.ts': {
      content: `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
`
    },
    'src/utils/logger.ts': {
      content: `import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: '{{PACKAGE_NAME}}' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
`
    },
    '.env.example': {
      content: `# Server
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (optional)
REDIS_URL=redis://localhost:6379
`
    },
    'tsconfig.json': {
      content: JSON.stringify({
        "compilerOptions": {
          "target": "ES2022",
          "module": "commonjs",
          "lib": ["ES2022"],
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "resolveJsonModule": true,
          "moduleResolution": "node",
          "allowJs": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noImplicitReturns": true,
          "noFallthroughCasesInSwitch": true
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
      }, null, 2)
    }
  }
};

// Export helper function to get template files
export function getPlatformTemplateFiles(template: string, variables: Record<string, string>): Array<{path: string, content: string}> {
  const templateFiles = PLATFORM_TEMPLATES[template];
  if (!templateFiles) {
    throw new Error(`Unknown platform template: ${template}`);
  }

  const files: Array<{path: string, content: string}> = [];

  for (const [path, file] of Object.entries(templateFiles)) {
    let content = file.content;
    
    // Replace variables in content
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    files.push({ path, content });
  }

  return files;
}