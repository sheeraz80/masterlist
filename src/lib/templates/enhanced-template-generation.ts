/**
 * Enhanced template generation with platform-specific content and 2025 tech stacks
 */

// Import platform-specific templates from our script
const PLATFORM_SPECIFIC_TEMPLATES: Record<string, any> = {
  // Flutter App Template
  'flutter-app': {
    'pubspec.yaml': `name: {{PACKAGE_NAME}}
description: {{PROJECT_DESCRIPTION}}
version: 0.1.0+1
publish_to: 'none'

environment:
  sdk: '>=3.8.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  provider: ^6.1.2
  http: ^1.2.2
  shared_preferences: ^2.3.3
  flutter_bloc: ^8.1.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
  build_runner: ^2.4.13
  json_serializable: ^6.9.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/fonts/`,
    
    'lib/main.dart': `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{{PROJECT_NAME}}',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: '{{PROJECT_NAME}}'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text('Welcome to {{PROJECT_NAME}}'),
          ],
        ),
      ),
    );
  }
}`,
    'analysis_options.yaml': `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    avoid_print: false
    prefer_const_constructors: true
    prefer_const_declarations: true`,
    '.gitignore': `# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.pub-cache/
.pub/
/build/

# Android related
**/android/**/gradle-wrapper.jar
**/android/.gradle
**/android/captures/
**/android/gradlew
**/android/gradlew.bat
**/android/local.properties
**/android/**/GeneratedPluginRegistrant.java

# iOS/XCode related
**/ios/**/*.mode1v3
**/ios/**/*.mode2v3
**/ios/**/*.moved-aside
**/ios/**/*.pbxuser
**/ios/**/*.perspectivev3
**/ios/**/*sync/
**/ios/**/.sconsign.dblite
**/ios/**/.tags*
**/ios/**/.vagrant/
**/ios/**/DerivedData/
**/ios/**/Icon?
**/ios/**/Pods/
**/ios/**/.symlinks/
**/ios/**/profile
**/ios/**/xcuserdata
**/ios/.generated/
**/ios/Flutter/App.framework
**/ios/Flutter/Flutter.framework
**/ios/Flutter/Flutter.podspec
**/ios/Flutter/Generated.xcconfig
**/ios/Flutter/app.flx
**/ios/Flutter/app.zip
**/ios/Flutter/flutter_assets/
**/ios/Flutter/flutter_export_environment.sh
**/ios/ServiceDefinitions.json
**/ios/Runner/GeneratedPluginRegistrant.*

# Exceptions to above rules.
!**/ios/**/default.mode1v3
!**/ios/**/default.mode2v3
!**/ios/**/default.pbxuser
!**/ios/**/default.perspectivev3`
  },

  // iOS App Template
  'ios-app': {
    'Package.swift': `// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "{{PACKAGE_NAME}}",
    platforms: [
        .iOS(.v18)
    ],
    products: [
        .library(
            name: "{{PACKAGE_NAME}}",
            targets: ["{{PACKAGE_NAME}}"])
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.10.0"),
        .package(url: "https://github.com/SwiftyJSON/SwiftyJSON.git", from: "5.0.2")
    ],
    targets: [
        .target(
            name: "{{PACKAGE_NAME}}",
            dependencies: ["Alamofire", "SwiftyJSON"]),
        .testTarget(
            name: "{{PACKAGE_NAME}}Tests",
            dependencies: ["{{PACKAGE_NAME}}"])
    ]
)`,
    'Sources/{{PACKAGE_NAME}}/ContentView.swift': `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Welcome to {{PROJECT_NAME}}")
        }
        .padding()
    }
}

#Preview {
    ContentView()
}`,
    '.gitignore': `# Xcode
#
# gitignore contributors: remember to update Global/Xcode.gitignore, Objective-C.gitignore & Swift.gitignore

## User settings
xcuserdata/

## compatibility with Xcode 8 and earlier (ignoring not required starting Xcode 9)
*.xcscmblueprint
*.xccheckout

## compatibility with Xcode 3 and earlier (ignoring not required starting Xcode 4)
build/
DerivedData/
*.moved-aside
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3

## Obj-C/Swift specific
*.hmap

## App packaging
*.ipa
*.dSYM.zip
*.dSYM

## Playgrounds
timeline.xctimeline
playground.xcworkspace

# Swift Package Manager
.build/
.swiftpm/
Package.resolved

# CocoaPods
Pods/

# Carthage
Carthage/Checkouts
Carthage/Build/

# fastlane
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots/**/*.png
fastlane/test_output`
  },

  // Android App Template
  'android-app': {
    'build.gradle.kts': `plugins {
    id("com.android.application") version "8.7.3"
    id("org.jetbrains.kotlin.android") version "2.1.0"
}

android {
    namespace = "com.corevecta.{{PACKAGE_NAME}}"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.corevecta.{{PACKAGE_NAME}}"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
    
    kotlinOptions {
        jvmTarget = "21"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.15"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui:1.7.5")
    implementation("androidx.compose.ui:ui-tooling-preview:1.7.5")
    implementation("androidx.compose.material3:material3:1.3.1")
    
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}`,
    'app/src/main/java/com/corevecta/{{PACKAGE_NAME}}/MainActivity.kt': `package com.corevecta.{{PACKAGE_NAME}}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.corevecta.{{PACKAGE_NAME}}.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Greeting("{{PROJECT_NAME}}")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Welcome to $name",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    AppTheme {
        Greeting("{{PROJECT_NAME}}")
    }
}`,
    '.gitignore': `# Built application files
*.apk
*.aar
*.ap_
*.aab

# Files for the ART/Dalvik VM
*.dex

# Java class files
*.class

# Generated files
bin/
gen/
out/
release/

# Gradle files
.gradle/
build/

# Local configuration file (sdk path, etc)
local.properties

# Proguard folder generated by Eclipse
proguard/

# Log Files
*.log

# Android Studio Navigation editor temp files
.navigation/

# Android Studio captures folder
captures/

# IntelliJ
*.iml
.idea/

# Keystore files
*.jks
*.keystore

# External native build folder generated in Android Studio 2.2 and later
.externalNativeBuild
.cxx/

# Google Services (e.g. APIs or Firebase)
google-services.json

# Freeline
freeline.py
freeline/
freeline_project_description.json`
  },

  // Python AI Template
  'python-ai': {
    'requirements.txt': `# Core dependencies
numpy==2.1.3
pandas==2.2.3
scikit-learn==1.5.2
matplotlib==3.9.3

# AI/ML frameworks
torch==2.5.1
transformers==4.47.0
langchain==0.3.9
openai==1.57.0

# Web framework (if needed)
fastapi==0.115.5
uvicorn==0.32.1
pydantic==2.10.3

# Development
pytest==8.3.4
black==24.10.0
ruff==0.8.3
mypy==1.13.0`,
    'pyproject.toml': `[build-system]
requires = ["setuptools>=75.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "{{PACKAGE_NAME}}"
version = "0.1.0"
description = "{{PROJECT_DESCRIPTION}}"
authors = [{name = "CoreVecta", email = "dev@corevecta.com"}]
readme = "README.md"
requires-python = ">=3.13"
license = {text = "MIT"}

[tool.black]
line-length = 88
target-version = ['py313']

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W"]
target-version = "py313"

[tool.mypy]
python_version = "3.13"
warn_return_any = true
warn_unused_configs = true`,
    'src/__init__.py': `"""{{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}"""

__version__ = "0.1.0"`,
    'src/main.py': `"""Main entry point for {{PROJECT_NAME}}"""

import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    """Main function"""
    logger.info("Starting {{PROJECT_NAME}}")
    # Your code here


if __name__ == "__main__":
    main()`,
    '.gitignore': `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
cover/

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# Pyre type checker
.pyre/

# pytype static type analyzer
.pytype/

# Cython debug symbols
cython_debug/`
  },

  // Ethereum Smart Contract Template
  'ethereum-contract': {
    'hardhat.config.js': `require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};`,
    'contracts/{{CONTRACT_NAME}}.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title {{PROJECT_NAME}}
 * @dev {{PROJECT_DESCRIPTION}}
 */
contract {{CONTRACT_NAME}} is ERC20, Ownable, Pausable {
    mapping(address => bool) public whitelist;
    
    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    
    constructor(uint256 initialSupply) ERC20("{{PROJECT_NAME}}", "{{SYMBOL}}") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function addToWhitelist(address account) public onlyOwner {
        whitelist[account] = true;
        emit AddedToWhitelist(account);
    }
    
    function removeFromWhitelist(address account) public onlyOwner {
        whitelist[account] = false;
        emit RemovedFromWhitelist(account);
    }
    
    function _update(address from, address to, uint256 amount) internal override whenNotPaused {
        super._update(from, to, amount);
    }
}`,
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "scripts": {
          "compile": "hardhat compile",
          "test": "hardhat test",
          "deploy": "hardhat run scripts/deploy.js",
          "verify": "hardhat verify"
        },
        "devDependencies": {
          "@nomicfoundation/hardhat-toolbox": "^5.0.0",
          "hardhat": "^2.22.0",
          "dotenv": "^16.4.7"
        },
        "dependencies": {
          "@openzeppelin/contracts": "^5.1.0"
        }
      }
    },
    '.gitignore': `node_modules
.env
coverage
coverage.json
typechain
typechain-types

# Hardhat files
cache
artifacts

# Editor
.vscode
.idea

# OS
.DS_Store`
  },

  // WordPress Plugin Template with PHP 8.4
  'wordpress-plugin': {
    '{{PLUGIN_NAME}}.php': `<?php
/**
 * Plugin Name: {{PROJECT_NAME}}
 * Plugin URI: https://github.com/corevecta-projects/{{PACKAGE_NAME}}
 * Description: {{PROJECT_DESCRIPTION}}
 * Version: 0.1.0
 * Requires at least: 6.8
 * Requires PHP: 8.4
 * Author: CoreVecta
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
define('{{PLUGIN_CONST}}_VERSION', '0.1.0');
define('{{PLUGIN_CONST}}_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('{{PLUGIN_CONST}}_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include the main plugin class
require_once {{PLUGIN_CONST}}_PLUGIN_DIR . 'includes/class-{{PACKAGE_NAME}}.php';

// Initialize the plugin
function {{PACKAGE_NAME}}_init() {
    $plugin = new {{PLUGIN_CLASS}}();
    $plugin->run();
}
add_action('plugins_loaded', '{{PACKAGE_NAME}}_init');

// Activation hook
register_activation_hook(__FILE__, '{{PACKAGE_NAME}}_activate');
function {{PACKAGE_NAME}}_activate() {
    // Activation code here
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, '{{PACKAGE_NAME}}_deactivate');
function {{PACKAGE_NAME}}_deactivate() {
    // Deactivation code here
    flush_rewrite_rules();
}`,
    'composer.json': {
      content: {
        "name": "corevecta/{{PACKAGE_NAME}}",
        "description": "{{PROJECT_DESCRIPTION}}",
        "type": "wordpress-plugin",
        "license": "GPL-2.0-or-later",
        "minimum-stability": "stable",
        "require": {
          "php": ">=8.4",
          "composer/installers": "^2.3"
        },
        "require-dev": {
          "phpunit/phpunit": "^11.5",
          "wp-coding-standards/wpcs": "^3.1",
          "dealerdirect/phpcodesniffer-composer-installer": "^1.0"
        },
        "scripts": {
          "test": "phpunit",
          "cs": "phpcs",
          "cs-fix": "phpcbf"
        }
      }
    },
    '.gitignore': `# WordPress
wp-config.php
wp-content/uploads/
wp-content/blogs.dir/
wp-content/upgrade/
wp-content/backup-db/
wp-content/advanced-cache.php
wp-content/wp-cache-config.php
sitemap.xml
*.log

# Composer
vendor/
composer.lock

# IDE
.idea
.vscode

# OS
.DS_Store
Thumbs.db`
  }
};

// Enhanced Chrome extension template with 2025 tech stack
const ENHANCED_CHROME_EXTENSION = {
  'manifest.json': {
    content: {
      "manifest_version": 3,
      "name": "{{PROJECT_NAME}}",
      "version": "0.1.0",
      "description": "{{PROJECT_DESCRIPTION}}",
      "permissions": [],
      "action": {
        "default_popup": "popup/popup.html",
        "default_icon": {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      },
      "background": {
        "service_worker": "background.js"
      },
      "content_scripts": [{
        "matches": ["<all_urls>"],
        "js": ["content.js"]
      }],
      "icons": {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    }
  },
  'package.json': {
    content: {
      "name": "{{PACKAGE_NAME}}",
      "version": "0.1.0",
      "description": "{{PROJECT_DESCRIPTION}}",
      "private": true,
      "scripts": {
        "dev": "webpack --mode development --watch",
        "build": "webpack --mode production",
        "test": "jest",
        "lint": "eslint src/**/*.{js,ts}",
        "clean": "rm -rf dist"
      },
      "devDependencies": {
        "@types/chrome": "^0.0.278",
        "webpack": "^5.97.0",
        "webpack-cli": "^5.1.4",
        "copy-webpack-plugin": "^12.0.2",
        "typescript": "^5.8.0",
        "ts-loader": "^9.5.1",
        "css-loader": "^7.1.2",
        "style-loader": "^4.0.0",
        "jest": "^29.7.0",
        "eslint": "^9.17.0",
        "@typescript-eslint/eslint-plugin": "^8.19.0",
        "@typescript-eslint/parser": "^8.19.0"
      }
    }
  },
  'webpack.config.js': {
    content: `const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content.js',
    popup: './src/popup/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/popup/popup.css', to: 'popup/popup.css' },
        { from: 'icons', to: 'icons' }
      ],
    }),
  ],
};`
  }
};

/**
 * Get platform-specific template files
 */
export function getEnhancedTemplateFiles(template: string): any {
  // Check platform-specific templates first
  if (PLATFORM_SPECIFIC_TEMPLATES[template]) {
    return PLATFORM_SPECIFIC_TEMPLATES[template];
  }
  
  // Special handling for browser extensions
  if (template.includes('extension') && template !== 'vscode-extension') {
    return ENHANCED_CHROME_EXTENSION;
  }
  
  // Default Node.js template for web apps
  if (template.includes('web-app') || template.includes('api')) {
    return {
      'package.json': {
        content: {
          "name": "{{PACKAGE_NAME}}",
          "version": "0.1.0",
          "description": "{{PROJECT_DESCRIPTION}}",
          "main": "dist/index.js",
          "scripts": {
            "dev": "tsx watch src/index.ts",
            "build": "tsc",
            "start": "node dist/index.js",
            "test": "jest",
            "lint": "eslint src/**/*.ts"
          },
          "dependencies": {
            "express": "^4.21.1",
            "dotenv": "^16.4.7"
          },
          "devDependencies": {
            "@types/node": "^22.10.2",
            "@types/express": "^5.0.0",
            "typescript": "^5.8.0",
            "tsx": "^4.19.2",
            "jest": "^29.7.0",
            "@types/jest": "^29.5.14",
            "eslint": "^9.17.0",
            "@typescript-eslint/eslint-plugin": "^8.19.0",
            "@typescript-eslint/parser": "^8.19.0"
          }
        }
      },
      'tsconfig.json': {
        content: {
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
            "declaration": true,
            "declarationMap": true,
            "sourceMap": true
          },
          "include": ["src/**/*"],
          "exclude": ["node_modules", "dist"]
        }
      },
      '.gitignore': `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
.idea/`
    };
  }
  
  // Return empty object if no specific template found
  return {};
}

/**
 * Process template placeholders
 */
export function processTemplatePlaceholders(content: string, data: any): string {
  return content.replace(/{{([^}]+)}}/g, (match, key) => {
    switch (key) {
      case 'PROJECT_NAME':
        return data.title || 'Project';
      case 'PROJECT_DESCRIPTION':
        return data.description || data.problem || 'Project description';
      case 'PACKAGE_NAME':
        return data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project';
      case 'CONTRACT_NAME':
        return data.title?.replace(/[^a-zA-Z0-9]/g, '') || 'Contract';
      case 'SYMBOL':
        return data.title?.substring(0, 4).toUpperCase() || 'SYMB';
      case 'PLUGIN_NAME':
        return data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'plugin';
      case 'PLUGIN_CONST':
        return data.title?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || 'PLUGIN';
      case 'PLUGIN_CLASS':
        return data.title?.replace(/[^a-zA-Z0-9]/g, '') || 'Plugin';
      case 'NAMESPACE':
        return data.title?.replace(/[^a-zA-Z0-9]/g, '') || 'Namespace';
      case 'CLASS_NAME':
        return data.title?.replace(/[^a-zA-Z0-9]/g, '') || 'ClassName';
      case 'MAIN_CLASS':
        return data.title?.replace(/[^a-zA-Z0-9]/g, '') + 'Plugin' || 'MainPlugin';
      case 'COMMAND':
        return data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'command';
      case 'PREFIX':
        return data.title?.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '') || 'PREFIX';
      default:
        return data[key] || match;
    }
  });
}

/**
 * Generate all template files for a project
 */
export function generateTemplateFiles(template: string, projectData: any): Record<string, any> {
  const templateFiles = getEnhancedTemplateFiles(template);
  const processedFiles: Record<string, any> = {};
  
  for (const [filename, content] of Object.entries(templateFiles)) {
    const processedFilename = processTemplatePlaceholders(filename, projectData);
    
    if (typeof content === 'string') {
      processedFiles[processedFilename] = processTemplatePlaceholders(content, projectData);
    } else if (content && typeof content === 'object' && 'content' in content) {
      // Handle JSON files
      const jsonString = JSON.stringify(content.content, null, 2);
      processedFiles[processedFilename] = processTemplatePlaceholders(jsonString, projectData);
    } else {
      processedFiles[processedFilename] = content;
    }
  }
  
  return processedFiles;
}