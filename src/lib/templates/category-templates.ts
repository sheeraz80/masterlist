export const CATEGORY_PROJECT_TEMPLATES = {
  'chrome-extension': {
    structure: {
      'src/': {
        'manifest.json': 'Extension manifest file',
        'background.js': 'Background service worker',
        'content.js': 'Content script',
        'popup/': {
          'popup.html': 'Extension popup UI',
          'popup.js': 'Popup JavaScript',
          'popup.css': 'Popup styles'
        },
        'options/': {
          'options.html': 'Options page',
          'options.js': 'Options JavaScript'
        },
        'icons/': 'Extension icons (16, 48, 128px)',
        'utils/': 'Utility functions',
        'lib/': 'Third-party libraries'
      },
      'tests/': 'Test files',
      'docs/': 'Documentation',
      'webpack.config.js': 'Build configuration'
    },
    dependencies: {
      dev: [
        '@types/chrome',
        'webpack',
        'webpack-cli',
        'copy-webpack-plugin',
        'typescript',
        'ts-loader',
        'css-loader',
        'style-loader'
      ]
    },
    scripts: {
      'dev': 'webpack --mode development --watch',
      'build': 'webpack --mode production',
      'test': 'jest',
      'lint': 'eslint src/**/*.{js,ts}'
    }
  },

  'web-app-nextjs': {
    structure: {
      'src/': {
        'app/': {
          'layout.tsx': 'Root layout',
          'page.tsx': 'Home page',
          'globals.css': 'Global styles',
          'api/': 'API routes'
        },
        'components/': {
          'ui/': 'UI components',
          'layout/': 'Layout components',
          'features/': 'Feature components'
        },
        'lib/': {
          'utils.ts': 'Utility functions',
          'constants.ts': 'App constants',
          'types.ts': 'TypeScript types'
        },
        'hooks/': 'Custom React hooks',
        'styles/': 'Additional styles'
      },
      'public/': 'Static assets',
      'prisma/': {
        'schema.prisma': 'Database schema'
      },
      'tests/': 'Test files'
    },
    dependencies: {
      prod: [
        'next',
        'react',
        'react-dom',
        '@prisma/client',
        'tailwindcss',
        '@radix-ui/react-dialog',
        'clsx',
        'date-fns'
      ],
      dev: [
        '@types/node',
        '@types/react',
        'typescript',
        'eslint',
        'prettier',
        'prisma',
        '@testing-library/react'
      ]
    },
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint',
      'test': 'jest',
      'db:push': 'prisma db push',
      'db:generate': 'prisma generate'
    }
  },

  'mobile-app-react-native': {
    structure: {
      'src/': {
        'screens/': 'Screen components',
        'components/': 'Reusable components',
        'navigation/': 'Navigation setup',
        'services/': 'API services',
        'utils/': 'Utilities',
        'assets/': 'Images, fonts',
        'constants/': 'App constants',
        'hooks/': 'Custom hooks',
        'store/': 'State management'
      },
      'ios/': 'iOS specific code',
      'android/': 'Android specific code',
      '__tests__/': 'Test files'
    },
    dependencies: {
      prod: [
        'react',
        'react-native',
        '@react-navigation/native',
        '@react-navigation/stack',
        'react-native-vector-icons',
        'react-native-async-storage',
        'axios'
      ],
      dev: [
        '@types/react',
        '@types/react-native',
        'typescript',
        '@react-native-community/eslint-config',
        'jest',
        'metro-react-native-babel-preset'
      ]
    },
    scripts: {
      'android': 'react-native run-android',
      'ios': 'react-native run-ios',
      'start': 'react-native start',
      'test': 'jest',
      'lint': 'eslint .'
    }
  },

  'api-backend-express': {
    structure: {
      'src/': {
        'controllers/': 'Route controllers',
        'models/': 'Data models',
        'routes/': 'API routes',
        'middleware/': 'Custom middleware',
        'services/': 'Business logic',
        'utils/': 'Utilities',
        'config/': 'Configuration',
        'validators/': 'Request validation',
        'index.ts': 'Entry point'
      },
      'tests/': {
        'unit/': 'Unit tests',
        'integration/': 'Integration tests'
      },
      'docs/': 'API documentation'
    },
    dependencies: {
      prod: [
        'express',
        'cors',
        'helmet',
        'compression',
        'dotenv',
        'joi',
        'winston',
        'prisma',
        '@prisma/client'
      ],
      dev: [
        '@types/express',
        '@types/node',
        'typescript',
        'ts-node-dev',
        'jest',
        '@types/jest',
        'supertest'
      ]
    },
    scripts: {
      'dev': 'ts-node-dev --respawn src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
      'test': 'jest',
      'test:watch': 'jest --watch',
      'lint': 'eslint src/**/*.ts'
    }
  },

  'vscode-extension': {
    structure: {
      'src/': {
        'extension.ts': 'Extension entry point',
        'commands/': 'Command implementations',
        'providers/': 'VS Code providers',
        'utils/': 'Utilities',
        'test/': 'Extension tests'
      },
      'images/': 'Icons and images',
      'snippets/': 'Code snippets',
      'syntaxes/': 'Language definitions',
      '.vscodeignore': 'Files to exclude from package'
    },
    dependencies: {
      dev: [
        '@types/vscode',
        '@types/node',
        'typescript',
        '@vscode/test-electron',
        'eslint',
        'vsce'
      ]
    },
    scripts: {
      'vscode:prepublish': 'npm run compile',
      'compile': 'tsc -p ./',
      'watch': 'tsc -watch -p ./',
      'test': 'node ./out/test/runTest.js',
      'package': 'vsce package',
      'publish': 'vsce publish'
    }
  },

  'ai-ml-python': {
    structure: {
      'src/': {
        'models/': 'ML models',
        'data/': 'Data processing',
        'training/': 'Training scripts',
        'inference/': 'Inference code',
        'utils/': 'Utilities',
        'api/': 'API endpoints'
      },
      'notebooks/': 'Jupyter notebooks',
      'tests/': 'Test files',
      'data/': 'Dataset storage',
      'models/': 'Saved models',
      'configs/': 'Configuration files',
      'requirements.txt': 'Python dependencies',
      'Dockerfile': 'Container setup'
    },
    dependencies: {
      prod: [
        'tensorflow',
        'torch',
        'numpy',
        'pandas',
        'scikit-learn',
        'fastapi',
        'uvicorn'
      ],
      dev: [
        'pytest',
        'black',
        'pylint',
        'jupyter',
        'matplotlib',
        'seaborn'
      ]
    },
    scripts: {
      'train': 'python src/training/train.py',
      'serve': 'uvicorn src.api.main:app --reload',
      'test': 'pytest',
      'lint': 'pylint src/',
      'format': 'black src/'
    }
  },

  'blockchain-solidity': {
    structure: {
      'contracts/': {
        'Token.sol': 'Token contract',
        'Governance.sol': 'Governance contract',
        'interfaces/': 'Contract interfaces',
        'libraries/': 'Solidity libraries'
      },
      'scripts/': 'Deployment scripts',
      'test/': 'Contract tests',
      'frontend/': {
        'src/': 'DApp frontend',
        'public/': 'Static assets'
      },
      'hardhat.config.js': 'Hardhat configuration'
    },
    dependencies: {
      dev: [
        'hardhat',
        '@nomiclabs/hardhat-ethers',
        '@nomiclabs/hardhat-waffle',
        '@openzeppelin/contracts',
        'ethers',
        'chai',
        '@types/chai'
      ]
    },
    scripts: {
      'compile': 'hardhat compile',
      'test': 'hardhat test',
      'deploy': 'hardhat run scripts/deploy.js',
      'verify': 'hardhat verify',
      'coverage': 'hardhat coverage'
    }
  },

  'desktop-electron': {
    structure: {
      'src/': {
        'main/': {
          'index.ts': 'Main process',
          'preload.ts': 'Preload script',
          'ipc/': 'IPC handlers'
        },
        'renderer/': {
          'index.html': 'Main window',
          'index.ts': 'Renderer process',
          'components/': 'UI components',
          'styles/': 'CSS files'
        },
        'shared/': 'Shared code'
      },
      'assets/': 'Icons and resources',
      'build/': 'Build configuration'
    },
    dependencies: {
      prod: [
        'electron-updater',
        'electron-store',
        'electron-log'
      ],
      dev: [
        'electron',
        'electron-builder',
        'typescript',
        'webpack',
        'webpack-cli',
        '@types/node'
      ]
    },
    scripts: {
      'start': 'electron .',
      'dev': 'webpack --mode development && electron .',
      'build': 'webpack --mode production',
      'dist': 'electron-builder',
      'dist:all': 'electron-builder -mwl'
    }
  },

  'cli-tool': {
    structure: {
      'src/': {
        'index.ts': 'CLI entry point',
        'commands/': 'Command implementations',
        'utils/': 'Utilities',
        'config/': 'Configuration',
        'templates/': 'File templates'
      },
      'bin/': 'Executable files',
      'tests/': 'Test files'
    },
    dependencies: {
      prod: [
        'commander',
        'inquirer',
        'chalk',
        'ora',
        'fs-extra',
        'axios'
      ],
      dev: [
        '@types/node',
        '@types/inquirer',
        'typescript',
        'jest',
        '@types/jest',
        'ts-node'
      ]
    },
    scripts: {
      'build': 'tsc',
      'dev': 'ts-node src/index.ts',
      'test': 'jest',
      'link': 'npm link',
      'publish': 'npm publish'
    }
  }
};