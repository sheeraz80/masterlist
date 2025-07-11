/**
 * Expanded platform templates for high-opportunity marketplaces
 */

export const EXPANDED_PLATFORM_TEMPLATES = {
  // WordPress Plugin Template
  'wordpress-plugin': {
    'plugin-name.php': {
      content: `<?php
/**
 * Plugin Name: {{PROJECT_NAME}}
 * Plugin URI: https://github.com/corevecta-projects/{{REPO_NAME}}
 * Description: {{PROJECT_DESCRIPTION}}
 * Version: 1.0.0
 * Author: CoreVecta LLC
 * Author URI: https://corevecta.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: {{PACKAGE_NAME}}
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('{{PLUGIN_CONST}}_VERSION', '1.0.0');
define('{{PLUGIN_CONST}}_PLUGIN_URL', plugin_dir_url(__FILE__));
define('{{PLUGIN_CONST}}_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Include required files
require_once {{PLUGIN_CONST}}_PLUGIN_PATH . 'includes/class-{{PACKAGE_NAME}}.php';

// Initialize the plugin
function {{PACKAGE_NAME}}_init() {
    $plugin = new {{PLUGIN_CLASS}}();
    $plugin->run();
}
add_action('plugins_loaded', '{{PACKAGE_NAME}}_init');

// Activation hook
register_activation_hook(__FILE__, '{{PACKAGE_NAME}}_activate');
function {{PACKAGE_NAME}}_activate() {
    // Activation logic here
}

// Deactivation hook
register_deactivation_hook(__FILE__, '{{PACKAGE_NAME}}_deactivate');
function {{PACKAGE_NAME}}_deactivate() {
    // Deactivation logic here
}`
    },
    'includes/class-{{PACKAGE_NAME}}.php': {
      content: `<?php
/**
 * Main plugin class
 */
class {{PLUGIN_CLASS}} {
    
    public function __construct() {
        $this->load_dependencies();
        $this->define_hooks();
    }
    
    private function load_dependencies() {
        // Load required files
    }
    
    private function define_hooks() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function init() {
        // Initialize plugin functionality
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script(
            '{{PACKAGE_NAME}}-script',
            {{PLUGIN_CONST}}_PLUGIN_URL . 'assets/js/main.js',
            array('jquery'),
            {{PLUGIN_CONST}}_VERSION,
            true
        );
    }
    
    public function run() {
        // Run the plugin
    }
}`
    },
    'readme.txt': {
      content: `=== {{PROJECT_NAME}} ===
Contributors: corevecta
Tags: {{TAGS}}
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

{{PROJECT_DESCRIPTION}}

== Description ==

{{FEATURES_LIST}}

== Installation ==

1. Upload the plugin files to the \`/wp-content/plugins/{{PACKAGE_NAME}}\` directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Configure the plugin settings

== Frequently Asked Questions ==

= How do I configure the plugin? =

Navigate to Settings > {{PROJECT_NAME}} in your WordPress admin panel.

== Screenshots ==

1. Main interface
2. Settings page

== Changelog ==

= 1.0.0 =
* Initial release`
    }
  },

  // Shopify App Template
  'shopify-app': {
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        scripts: {
          dev: 'shopify app dev',
          build: 'shopify app build',
          deploy: 'shopify app deploy',
          generate: 'shopify app generate',
          test: 'jest'
        },
        dependencies: {
          '@shopify/app': '^3.0.0',
          '@shopify/cli': '^3.0.0',
          '@shopify/polaris': '^12.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'express': '^4.18.2'
        }
      }
    },
    'shopify.app.toml': {
      content: `# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

name = "{{PROJECT_NAME}}"
client_id = ""
application_url = "https://{{PACKAGE_NAME}}.ngrok.io"

[access_scopes]
scopes = "write_products,read_orders"

[auth]
redirect_urls = [
  "https://{{PACKAGE_NAME}}.ngrok.io/auth/callback",
  "https://{{PACKAGE_NAME}}.ngrok.io/api/auth/callback"
]

[webhooks]
api_version = "2024-01"

[pos]
embedded = false

[build]
dev_store_url = "{{PACKAGE_NAME}}.myshopify.com"`
    },
    'web/index.js': {
      content: `import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

const app = express();

const shopify = shopifyApp({
  api: {
    apiVersion: "2024-01",
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  sessionStorage: new SQLiteSessionStorage("database.sqlite"),
});

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// Your API routes here
app.get("/api/products", async (req, res) => {
  const session = res.locals.shopify.session;
  // Implement product fetching logic
  res.json({ products: [] });
});

app.use(shopify.cspHeaders());
app.use(express.static("dist"));

app.listen(process.env.PORT || 3000);`
    }
  },

  // OpenAI GPT Template
  'openai-gpt': {
    'gpt-config.json': {
      content: {
        name: '{{PROJECT_NAME}}',
        description: '{{PROJECT_DESCRIPTION}}',
        version: '1.0.0',
        author: 'CoreVecta LLC',
        features: '{{FEATURES_LIST}}',
        instructions: `You are {{PROJECT_NAME}}, an AI assistant that helps users with specific tasks.

Key capabilities:
{{FEATURES_LIST}}

Instructions:
1. Always be helpful and professional
2. Provide clear, actionable responses
3. Ask clarifying questions when needed
4. Maintain context throughout the conversation

Limitations:
- Cannot access external websites without user permission
- Cannot store personal information
- Should not provide legal, medical, or financial advice`,
        conversation_starters: [
          'How can I help you today?',
          'What would you like to accomplish?',
          'Tell me about your project'
        ],
        tools: ['dalle', 'browser', 'python'],
        capabilities: {
          web_browsing: true,
          dalle_image_generation: true,
          code_interpreter: true
        }
      }
    },
    'actions/api-schema.json': {
      content: {
        openapi: '3.1.0',
        info: {
          title: '{{PROJECT_NAME}} API',
          version: '1.0.0',
          description: 'API for {{PROJECT_NAME}} GPT actions'
        },
        servers: [
          {
            url: 'https://api.{{PACKAGE_NAME}}.com'
          }
        ],
        paths: {
          '/execute': {
            post: {
              summary: 'Execute main action',
              operationId: 'executeAction',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        input: { type: 'string' },
                        parameters: { type: 'object' }
                      }
                    }
                  }
                }
              },
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          result: { type: 'string' },
                          data: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    'README.md': {
      content: `# {{PROJECT_NAME}} - OpenAI GPT

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## Setup Instructions

1. Go to [ChatGPT](https://chat.openai.com)
2. Navigate to "Explore GPTs" → "Create a GPT"
3. Copy the contents of \`gpt-config.json\` into the configuration
4. If using actions, upload \`actions/api-schema.json\`
5. Configure any required API keys or authentication
6. Test the GPT thoroughly before publishing

## Customization

- Modify the instructions in \`gpt-config.json\` to change behavior
- Add custom actions by updating the OpenAPI schema
- Integrate with external APIs for enhanced functionality

## Monetization

- OpenAI revenue sharing program
- Premium features via API actions
- Lead generation for services

## Support

Created by CoreVecta LLC
Part of the Masterlist platform`
    }
  },

  // Slack App Template
  'slack-app': {
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        main: 'app.js',
        scripts: {
          start: 'node app.js',
          dev: 'nodemon app.js',
          test: 'jest'
        },
        dependencies: {
          '@slack/bolt': '^3.13.0',
          '@slack/web-api': '^6.8.0',
          'dotenv': '^16.0.3',
          'express': '^4.18.2'
        }
      }
    },
    'app.js': {
      content: `require('dotenv').config();
const { App } = require('@slack/bolt');

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Listen for slash commands
app.command('/{{PACKAGE_NAME}}', async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    text: \`Hello! I'm {{PROJECT_NAME}}. {{PROJECT_DESCRIPTION}}\`
  });
});

// Listen for messages
app.message('hello', async ({ message, say }) => {
  await say(\`Hey there <@\${message.user}>! How can I help you today?\`);
});

// Listen for app home opened events
app.event('app_home_opened', async ({ event, client }) => {
  try {
    const result = await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Welcome to {{PROJECT_NAME}}!* :wave:'
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '{{PROJECT_DESCRIPTION}}'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ {{PROJECT_NAME}} is running!');
})();`
    },
    'manifest.json': {
      content: {
        display_information: {
          name: '{{PROJECT_NAME}}',
          description: '{{PROJECT_DESCRIPTION}}',
          background_color: '#4A154B'
        },
        features: {
          bot_user: {
            display_name: '{{PROJECT_NAME}}',
            always_online: true
          },
          slash_commands: [
            {
              command: '/{{PACKAGE_NAME}}',
              description: 'Main command for {{PROJECT_NAME}}',
              usage_hint: '[action] [parameters]'
            }
          ]
        },
        oauth_config: {
          scopes: {
            bot: [
              'commands',
              'chat:write',
              'app_mentions:read',
              'channels:history',
              'groups:history',
              'im:history',
              'mpim:history'
            ]
          }
        },
        settings: {
          event_subscriptions: {
            bot_events: [
              'app_home_opened',
              'message.channels',
              'message.groups',
              'message.im',
              'message.mpim'
            ]
          },
          interactivity: {
            is_enabled: true
          }
        }
      }
    }
  },

  // GitHub Action Template
  'github-action': {
    'action.yml': {
      content: `name: '{{PROJECT_NAME}}'
description: '{{PROJECT_DESCRIPTION}}'
author: 'CoreVecta LLC'

branding:
  icon: 'zap'
  color: 'blue'

inputs:
  api-key:
    description: 'API key for authentication (if needed)'
    required: false
  
  target:
    description: 'Target to analyze/process'
    required: true
    default: '.'
  
  options:
    description: 'Additional options as JSON'
    required: false
    default: '{}'

outputs:
  result:
    description: 'Result of the action'
  
  report-url:
    description: 'URL to detailed report (if applicable)'

runs:
  using: 'composite'
  steps:
    - name: Setup
      shell: bash
      run: |
        echo "Setting up {{PROJECT_NAME}}..."
        echo "Target: \${{ inputs.target }}"
    
    - name: Run {{PROJECT_NAME}}
      shell: bash
      run: |
        # Main action logic here
        \${{ github.action_path }}/scripts/run.sh \
          --target "\${{ inputs.target }}" \
          --options '\${{ inputs.options }}'
    
    - name: Generate Report
      shell: bash
      run: |
        echo "Generating report..."
        echo "result=success" >> \$GITHUB_OUTPUT
        echo "report-url=https://example.com/report" >> \$GITHUB_OUTPUT`
    },
    'scripts/run.sh': {
      content: `#!/bin/bash
set -e

# {{PROJECT_NAME}} - Main execution script

TARGET=\${1:-"."}
OPTIONS=\${2:-"{}"}

echo "🚀 Running {{PROJECT_NAME}}..."
echo "Target: \$TARGET"
echo "Options: \$OPTIONS"

# Add your main logic here
# This could call Node.js, Python, or any other runtime

echo "✅ {{PROJECT_NAME}} completed successfully!"`
    },
    'README.md': {
      content: `# {{PROJECT_NAME}} - GitHub Action

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## Usage

\`\`\`yaml
name: CI
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run {{PROJECT_NAME}}
        uses: corevecta-projects/{{REPO_NAME}}@v1
        with:
          target: './src'
          api-key: \${{ secrets.API_KEY }}
          options: |
            {
              "verbose": true,
              "format": "json"
            }
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: results
          path: results/
\`\`\`

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| \`target\` | Target directory or file | Yes | \`.\` |
| \`api-key\` | API key for authentication | No | - |
| \`options\` | Additional options as JSON | No | \`{}\` |

## Outputs

| Output | Description |
|--------|-------------|
| \`result\` | Result status of the action |
| \`report-url\` | URL to detailed report |

## Examples

### Basic usage
\`\`\`yaml
- uses: corevecta-projects/{{REPO_NAME}}@v1
  with:
    target: './src'
\`\`\`

### With options
\`\`\`yaml
- uses: corevecta-projects/{{REPO_NAME}}@v1
  with:
    target: './src'
    options: |
      {
        "exclude": ["test/**", "docs/**"],
        "format": "markdown"
      }
\`\`\`

## License

MIT - CoreVecta LLC`
    }
  },

  // Google Workspace Add-on Template
  'google-workspace-addon': {
    'appsscript.json': {
      content: {
        timeZone: 'America/New_York',
        dependencies: {
          enabledAdvancedServices: [
            {
              userSymbol: 'Drive',
              serviceId: 'drive',
              version: 'v2'
            }
          ]
        },
        exceptionLogging: 'STACKDRIVER',
        runtimeVersion: 'V8',
        oauthScopes: [
          'https://www.googleapis.com/auth/script.container.ui',
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets'
        ],
        addOns: {
          common: {
            name: '{{PROJECT_NAME}}',
            logoUrl: 'https://www.example.com/logo.png',
            homepageTrigger: {
              runFunction: 'onHomepage',
              enabled: true
            }
          },
          sheets: {
            homepageTrigger: {
              runFunction: 'onSheetsHomepage',
              enabled: true
            }
          },
          docs: {
            homepageTrigger: {
              runFunction: 'onDocsHomepage',
              enabled: true
            }
          }
        }
      }
    },
    'Code.gs': {
      content: `/**
 * {{PROJECT_NAME}} - Google Workspace Add-on
 * {{PROJECT_DESCRIPTION}}
 */

// Homepage handler
function onHomepage(e) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('{{PROJECT_NAME}}')
      .setImageUrl('https://www.example.com/logo.png'))
    .addSection(createMainSection())
    .build();
  
  return [card];
}

// Create main section
function createMainSection() {
  const section = CardService.newCardSection()
    .setHeader('Welcome to {{PROJECT_NAME}}')
    .addWidget(CardService.newTextParagraph()
      .setText('{{PROJECT_DESCRIPTION}}'))
    .addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Get Started')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('handleGetStarted'))));
  
  return section;
}

// Handle button click
function handleGetStarted(e) {
  // Your main functionality here
  const notification = CardService.newNotification()
    .setText('{{PROJECT_NAME}} is processing...');
  
  return CardService.newActionResponseBuilder()
    .setNotification(notification)
    .build();
}

// Sheets-specific homepage
function onSheetsHomepage(e) {
  // Customize for Google Sheets
  return onHomepage(e);
}

// Docs-specific homepage  
function onDocsHomepage(e) {
  // Customize for Google Docs
  return onHomepage(e);
}`
    },
    'README.md': {
      content: `# {{PROJECT_NAME}} - Google Workspace Add-on

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## Development Setup

1. Install clasp: \`npm install -g @google/clasp\`
2. Login: \`clasp login\`
3. Create project: \`clasp create --type addon\`
4. Push code: \`clasp push\`
5. Open in browser: \`clasp open\`

## Testing

1. In Apps Script editor, click "Deploy" → "Test deployments"
2. Install the add-on in a test document
3. Test all functionality thoroughly

## Publishing

1. Configure OAuth consent screen in Google Cloud Console
2. Submit for verification if using sensitive scopes
3. Publish to Google Workspace Marketplace

## Support

Created by CoreVecta LLC`
    }
  }
};