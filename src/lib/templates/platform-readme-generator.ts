/**
 * Generate platform-specific README files with correct tech stacks
 */

export function generatePlatformReadme(template: string, projectData: any): string {
  const readmeTemplates: Record<string, string> = {
    'chrome-extension': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Runtime**: Chrome Extension Manifest V3
- **Language**: TypeScript 5.8
- **Build Tool**: Webpack 5
- **Framework**: Vanilla JS with Chrome APIs
- **Testing**: Jest with Chrome API mocks

## 📋 Prerequisites

- Node.js 22.x LTS
- npm 10.8.x or yarn
- Google Chrome or Chromium browser
- Chrome Extension Developer mode enabled

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Build the extension:
\`\`\`bash
npm run build
\`\`\`

## 💻 Development

1. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

2. Load the extension in Chrome:
   - Open Chrome and navigate to \`chrome://extensions\`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the \`dist\` folder

3. The extension will hot-reload on file changes

## 📦 Building for Production

\`\`\`bash
npm run build:prod
\`\`\`

This creates an optimized build in the \`dist\` folder.

## 🧪 Testing

\`\`\`bash
npm test
\`\`\`

## 📁 Project Structure

\`\`\`
├── src/
│   ├── background.js    # Service worker
│   ├── content.js       # Content script
│   └── popup/          # Extension popup
├── manifest.json       # Extension manifest
├── webpack.config.js   # Build configuration
└── package.json
\`\`\`

## 🔑 Permissions

This extension requires the following permissions:
- \`activeTab\`: Access to the current tab
- \`storage\`: Store user preferences

## 🤝 Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.`,

    'firefox-extension': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Runtime**: Firefox WebExtensions API
- **Language**: TypeScript 5.8
- **Build Tool**: Webpack 5
- **Framework**: Vanilla JS with WebExtensions APIs
- **Testing**: Jest with WebExtensions polyfill

## 📋 Prerequisites

- Node.js 22.x LTS
- npm 10.8.x or yarn
- Firefox Developer Edition or Firefox
- about:debugging enabled for extension testing

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Build the extension:
\`\`\`bash
npm run build
\`\`\`

## 💻 Development

1. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

2. Load the extension in Firefox:
   - Open Firefox and navigate to \`about:debugging\`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the \`manifest.json\` file from the \`dist\` folder

## 📦 Building for Production

\`\`\`bash
npm run build:prod
npm run package
\`\`\`

This creates a signed .xpi file for distribution.

## 🧪 Testing

\`\`\`bash
npm test
npm run test:firefox
\`\`\`

## 🔐 Signing

To sign your extension for distribution:
\`\`\`bash
npm run sign
\`\`\`

## 📄 License

This project is licensed under the MIT License.`,

    'flutter-app': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Framework**: Flutter 3.32
- **Language**: Dart 3.8
- **State Management**: Provider / Bloc
- **HTTP Client**: Dio
- **Local Storage**: SharedPreferences
- **Testing**: Flutter Test Framework

## 📋 Prerequisites

- Flutter SDK 3.32 or higher
- Dart 3.8 or higher
- Android Studio / Xcode (for mobile development)
- VS Code or Android Studio with Flutter plugins
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
flutter pub get
\`\`\`

3. Run code generation (if needed):
\`\`\`bash
flutter pub run build_runner build
\`\`\`

## 💻 Development

### Running on iOS Simulator
\`\`\`bash
flutter run -d ios
\`\`\`

### Running on Android Emulator
\`\`\`bash
flutter run -d android
\`\`\`

### Running on Web
\`\`\`bash
flutter run -d chrome
\`\`\`

## 📱 Building for Release

### Android APK
\`\`\`bash
flutter build apk --release
\`\`\`

### Android App Bundle
\`\`\`bash
flutter build appbundle --release
\`\`\`

### iOS
\`\`\`bash
flutter build ios --release
\`\`\`

### Web
\`\`\`bash
flutter build web --release
\`\`\`

## 🧪 Testing

Run all tests:
\`\`\`bash
flutter test
\`\`\`

Run tests with coverage:
\`\`\`bash
flutter test --coverage
\`\`\`

## 📁 Project Structure

\`\`\`
lib/
├── main.dart           # App entry point
├── models/            # Data models
├── screens/           # UI screens
├── widgets/           # Reusable widgets
├── services/          # API and services
└── utils/             # Utilities and helpers
\`\`\`

## 🎨 Design System

This app follows Material Design 3 guidelines with custom theming.

## 📄 License

This project is licensed under the MIT License.`,

    'ios-app': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Language**: Swift 6.0
- **SDK**: iOS 18 SDK
- **UI Framework**: SwiftUI
- **Networking**: URLSession / Alamofire
- **Database**: Core Data / SwiftData
- **Testing**: XCTest

## 📋 Prerequisites

- macOS 14.0 or later
- Xcode 16.0 or later
- iOS 18 SDK
- CocoaPods or Swift Package Manager
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies using Swift Package Manager:
\`\`\`bash
xcodebuild -resolvePackageDependencies
\`\`\`

Or using CocoaPods:
\`\`\`bash
pod install
\`\`\`

3. Open the project:
\`\`\`bash
open {{PROJECT_NAME}}.xcodeproj
\`\`\`

## 💻 Development

### Running on Simulator
1. Select a simulator from the Xcode device menu
2. Press Cmd+R or click the Run button

### Running on Device
1. Connect your iOS device
2. Select it from the device menu
3. Ensure proper provisioning profiles are set
4. Press Cmd+R

## 📱 Building for Release

### TestFlight
\`\`\`bash
xcodebuild -scheme {{PROJECT_NAME}} -configuration Release archive
\`\`\`

### App Store
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Submit for review

## 🧪 Testing

Run unit tests:
\`\`\`bash
xcodebuild test -scheme {{PROJECT_NAME}} -destination 'platform=iOS Simulator,name=iPhone 15'
\`\`\`

Run UI tests:
\`\`\`bash
xcodebuild test -scheme {{PROJECT_NAME}}UITests -destination 'platform=iOS Simulator,name=iPhone 15'
\`\`\`

## 📁 Project Structure

\`\`\`
{{PROJECT_NAME}}/
├── Models/            # Data models
├── Views/             # SwiftUI views
├── ViewModels/        # View models (MVVM)
├── Services/          # API and services
├── Utilities/         # Helper functions
└── Resources/         # Assets and configs
\`\`\`

## 🔐 Code Signing

Ensure you have proper certificates and provisioning profiles set up in Xcode.

## 📄 License

This project is licensed under the MIT License.`,

    'android-app': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Language**: Kotlin 2.1.0
- **SDK**: Android SDK 35 (Android 16)
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM with Clean Architecture
- **DI**: Hilt/Dagger
- **Networking**: Retrofit + OkHttp
- **Database**: Room
- **Testing**: JUnit 5 + Espresso

## 📋 Prerequisites

- Android Studio 2025.1 or later
- Android SDK 35
- Gradle 8.10
- JDK 21 LTS
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Open in Android Studio:
\`\`\`bash
studio .
\`\`\`

3. Sync Gradle files:
   - Android Studio will automatically prompt to sync
   - Or manually: File → Sync Project with Gradle Files

## 💻 Development

### Running on Emulator
1. Create an AVD with API 35 in AVD Manager
2. Select the emulator from device dropdown
3. Click Run or press Shift+F10

### Running on Device
1. Enable Developer Options and USB Debugging on your device
2. Connect via USB
3. Select your device from the dropdown
4. Click Run

## 📱 Building for Release

### Debug APK
\`\`\`bash
./gradlew assembleDebug
\`\`\`

### Release APK
\`\`\`bash
./gradlew assembleRelease
\`\`\`

### App Bundle (for Play Store)
\`\`\`bash
./gradlew bundleRelease
\`\`\`

## 🧪 Testing

Run unit tests:
\`\`\`bash
./gradlew test
\`\`\`

Run instrumentation tests:
\`\`\`bash
./gradlew connectedAndroidTest
\`\`\`

Run all tests with coverage:
\`\`\`bash
./gradlew jacocoTestReport
\`\`\`

## 📁 Project Structure

\`\`\`
app/src/main/java/com/corevecta/{{PACKAGE_NAME}}/
├── data/              # Data layer
│   ├── api/          # API interfaces
│   ├── db/           # Database
│   └── repository/   # Repositories
├── domain/           # Domain layer
│   ├── model/        # Domain models
│   └── usecase/      # Use cases
├── presentation/     # Presentation layer
│   ├── ui/           # Composables
│   └── viewmodel/    # ViewModels
└── di/               # Dependency injection
\`\`\`

## 🎨 Design System

This app follows Material Design 3 guidelines with dynamic color support.

## 📄 License

This project is licensed under the MIT License.`,

    'python-ai': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Language**: Python 3.13
- **AI Framework**: PyTorch 2.5 / TensorFlow 2.18
- **ML Libraries**: scikit-learn 1.5.2, transformers 4.47
- **Web Framework**: FastAPI 0.115
- **Database**: PostgreSQL with SQLAlchemy
- **Testing**: pytest 8.3

## 📋 Prerequisites

- Python 3.13 or higher
- pip 24.x or Poetry
- Virtual environment (venv)
- CUDA 12.6 (optional, for GPU support)
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Create virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

3. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

## 💻 Development

### Running the application
\`\`\`bash
python src/main.py
\`\`\`

### Running the API server
\`\`\`bash
uvicorn src.api:app --reload --host 0.0.0.0 --port 8000
\`\`\`

### Training models
\`\`\`bash
python scripts/train.py --config configs/model_config.yaml
\`\`\`

## 🧪 Testing

Run all tests:
\`\`\`bash
pytest
\`\`\`

Run with coverage:
\`\`\`bash
pytest --cov=src --cov-report=html
\`\`\`

Run specific test file:
\`\`\`bash
pytest tests/test_model.py
\`\`\`

## 📊 Model Information

- **Architecture**: [Describe model architecture]
- **Training Data**: [Describe dataset]
- **Performance**: [Add metrics]
- **Inference Time**: [Add benchmarks]

## 🚀 Deployment

### Using Docker
\`\`\`bash
docker build -t {{PROJECT_NAME}} .
docker run -p 8000:8000 {{PROJECT_NAME}}
\`\`\`

### Using Kubernetes
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── models/           # ML model definitions
├── data/            # Data processing
├── training/        # Training scripts
├── api/             # FastAPI endpoints
├── utils/           # Utilities
└── config/          # Configuration
tests/               # Test files
notebooks/           # Jupyter notebooks
scripts/             # Utility scripts
\`\`\`

## 📄 License

This project is licensed under the MIT License.`,

    'ethereum-contract': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Language**: Solidity 0.8.28
- **Framework**: Hardhat 2.22
- **Testing**: Hardhat + Chai + Ethers.js
- **Security**: OpenZeppelin Contracts 5.1
- **Network**: Ethereum Mainnet / Sepolia Testnet
- **Tools**: Etherscan verification, Gas optimization

## 📋 Prerequisites

- Node.js 22.x LTS
- npm 10.8.x or yarn
- MetaMask wallet
- Ethereum RPC endpoint (Alchemy/Infura)
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Add your private key and RPC URLs
\`\`\`

## 💻 Development

### Compile contracts
\`\`\`bash
npx hardhat compile
\`\`\`

### Run local node
\`\`\`bash
npx hardhat node
\`\`\`

### Deploy to local
\`\`\`bash
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

## 🧪 Testing

Run all tests:
\`\`\`bash
npx hardhat test
\`\`\`

Run with gas reporting:
\`\`\`bash
REPORT_GAS=true npx hardhat test
\`\`\`

Run coverage:
\`\`\`bash
npx hardhat coverage
\`\`\`

## 🚀 Deployment

### Deploy to Sepolia
\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

### Deploy to Mainnet
\`\`\`bash
npx hardhat run scripts/deploy.js --network mainnet
\`\`\`

### Verify on Etherscan
\`\`\`bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor args"
\`\`\`

## 📊 Gas Optimization

- Uses custom errors instead of revert strings
- Implements efficient storage patterns
- Optimized for common operations

## 🔒 Security

- Audited by [Audit Firm Name]
- Implements reentrancy guards
- Uses battle-tested OpenZeppelin contracts
- Follows checks-effects-interactions pattern

## 📁 Contract Structure

\`\`\`
contracts/
├── {{CONTRACT_NAME}}.sol    # Main contract
├── interfaces/              # Contract interfaces
└── libraries/              # Shared libraries
\`\`\`

## 📄 License

This project is licensed under the MIT License.`,

    'wordpress-plugin': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **CMS**: WordPress 6.8+
- **Language**: PHP 8.4
- **Database**: MySQL 8.0
- **Frontend**: JavaScript ES6+ with WordPress Block Editor
- **Build Tools**: Composer, webpack
- **Testing**: PHPUnit, WordPress Test Suite

## 📋 Prerequisites

- PHP 8.4 or higher
- MySQL 8.0 or MariaDB 10.11
- WordPress 6.8 or higher
- Composer 2.8
- Node.js 22.x LTS (for build tools)
- Git

## 🛠️ Installation

### From WordPress Admin

1. Download the plugin zip file
2. Navigate to Plugins → Add New → Upload Plugin
3. Select the zip file and click Install Now
4. Activate the plugin

### Manual Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install PHP dependencies:
\`\`\`bash
composer install --no-dev
\`\`\`

3. Build assets:
\`\`\`bash
npm install
npm run build
\`\`\`

4. Copy to WordPress plugins directory:
\`\`\`bash
cp -r . /path/to/wordpress/wp-content/plugins/{{PLUGIN_NAME}}
\`\`\`

## 💻 Development

### Setup development environment
\`\`\`bash
composer install
npm install
\`\`\`

### Watch for changes
\`\`\`bash
npm run watch
\`\`\`

### Build for production
\`\`\`bash
npm run build
\`\`\`

## 🧪 Testing

### Run PHP tests
\`\`\`bash
composer test
\`\`\`

### Run JavaScript tests
\`\`\`bash
npm test
\`\`\`

### Check coding standards
\`\`\`bash
composer cs
\`\`\`

## 🔌 Hooks & Filters

### Actions
- \`{{PLUGIN_NAME}}_init\`: Fired when plugin initializes
- \`{{PLUGIN_NAME}}_loaded\`: Fired after plugin fully loads

### Filters
- \`{{PLUGIN_NAME}}_settings\`: Modify plugin settings
- \`{{PLUGIN_NAME}}_output\`: Filter plugin output

## 📁 Plugin Structure

\`\`\`
{{PLUGIN_NAME}}/
├── includes/          # PHP classes and functions
├── admin/            # Admin functionality
├── public/           # Frontend functionality
├── assets/           # CSS, JS, images
├── languages/        # Translation files
└── {{PLUGIN_NAME}}.php  # Main plugin file
\`\`\`

## 🌐 Internationalization

This plugin is translation-ready. To translate:
1. Use the POT file in \`languages/\` directory
2. Create your translation files
3. Place them in the same directory

## 📄 License

This project is licensed under the GPL v2 or later.`,

    'discord-bot': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Runtime**: Node.js 22.x LTS
- **Library**: discord.js 14.16
- **Language**: TypeScript 5.8
- **Database**: PostgreSQL / MongoDB
- **Hosting**: Discord Bot Hosting / VPS
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 22.x LTS
- npm 10.8.x or yarn
- Discord Bot Token (from Discord Developer Portal)
- PostgreSQL or MongoDB (optional)
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Add your Discord bot token and other configs
\`\`\`

4. Build the TypeScript code:
\`\`\`bash
npm run build
\`\`\`

## 💻 Development

### Running in development mode
\`\`\`bash
npm run dev
\`\`\`

### Deploy slash commands
\`\`\`bash
npm run deploy-commands
\`\`\`

### Adding new commands
1. Create a new file in \`src/commands/\`
2. Export a command object with \`data\` and \`execute\` properties
3. The bot will automatically load it

## 🤖 Bot Setup

1. Create a new application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot user and copy the token
3. Invite the bot to your server with appropriate permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Add Reactions
   - Use Slash Commands

## 🧪 Testing

Run tests:
\`\`\`bash
npm test
\`\`\`

## 🚀 Deployment

### Using PM2
\`\`\`bash
pm2 start dist/index.js --name {{PROJECT_NAME}}
\`\`\`

### Using Docker
\`\`\`bash
docker build -t {{PROJECT_NAME}} .
docker run -d --env-file .env {{PROJECT_NAME}}
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── commands/         # Slash commands
├── events/          # Discord event handlers
├── utils/           # Utility functions
└── index.ts         # Bot entry point
\`\`\`

## 🔒 Permissions

Required bot permissions:
- \`SEND_MESSAGES\`
- \`EMBED_LINKS\`
- \`READ_MESSAGE_HISTORY\`
- \`ADD_REACTIONS\`
- \`USE_APPLICATION_COMMANDS\`

## 📄 License

This project is licensed under the MIT License.`,

    'unity-asset': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Engine**: Unity 6.1 LTS
- **Language**: C# 12
- **Minimum Unity Version**: 6.1.0f1
- **Platforms**: Windows, macOS, Linux, iOS, Android, WebGL
- **Dependencies**: TextMeshPro

## 📋 Prerequisites

- Unity Hub 3.10 or later
- Unity 6.1 LTS or higher
- Visual Studio 2022 / VS Code with C# extension
- Git with LFS support

## 🛠️ Installation

### Via Unity Package Manager

1. Open Unity Package Manager (Window → Package Manager)
2. Click the + button → Add package from git URL
3. Enter: \`https://github.com/corevecta-projects/{{REPO_NAME}}.git\`

### Manual Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
\`\`\`

2. Copy the contents to your Unity project's Assets folder

## 💻 Usage

### Basic Setup

1. Import the package into your project
2. Add the {{CLASS_NAME}} component to a GameObject
3. Configure the settings in the Inspector
4. Press Play to see it in action

### Code Example

\`\`\`csharp
using CoreVecta.{{NAMESPACE}};

public class Example : MonoBehaviour
{
    private {{CLASS_NAME}} myAsset;
    
    void Start()
    {
        myAsset = GetComponent<{{CLASS_NAME}}>();
        myAsset.Initialize();
    }
}
\`\`\`

## 🎮 Features

- Easy to integrate
- Optimized performance
- Mobile-friendly
- Extensive documentation
- Demo scenes included

## 📁 Package Structure

\`\`\`
{{PROJECT_NAME}}/
├── Runtime/           # Runtime scripts
│   ├── Scripts/      # C# scripts
│   └── Shaders/      # Custom shaders
├── Editor/           # Editor scripts
├── Samples/          # Example scenes
├── Documentation/    # User manual
└── Tests/           # Unit tests
\`\`\`

## 🧪 Testing

This package includes unit tests. To run them:
1. Open Test Runner (Window → General → Test Runner)
2. Select the tests
3. Click Run All

## 📱 Platform Support

- ✅ Windows
- ✅ macOS
- ✅ Linux
- ✅ iOS
- ✅ Android
- ✅ WebGL
- ✅ PlayStation
- ✅ Xbox
- ✅ Nintendo Switch

## 🤝 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues](https://github.com/corevecta-projects/{{REPO_NAME}}/issues)
- Discord: [Community Server]

## 📄 License

This project is licensed under the MIT License.`,

    'shopify-app': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Platform**: Shopify App (Embedded)
- **Runtime**: Node.js 22.x LTS
- **Framework**: Shopify CLI 3.70
- **Frontend**: React with Polaris 13.12
- **API**: Shopify Admin API 2025-07
- **Database**: PostgreSQL / MongoDB
- **Hosting**: Shopify App Hosting / Heroku

## 📋 Prerequisites

- Node.js 22.x LTS
- npm 10.8.x or yarn
- Shopify Partner account
- Shopify development store
- ngrok (for local development)
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/{{REPO_NAME}}.git
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Connect to Shopify:
\`\`\`bash
shopify app connect
\`\`\`

4. Update app configuration in \`shopify.app.toml\`

## 💻 Development

### Start development server
\`\`\`bash
shopify app dev
\`\`\`

This will:
- Start the app server
- Create an ngrok tunnel
- Hot reload on changes

### Update app permissions
Edit \`shopify.app.toml\` and run:
\`\`\`bash
shopify app deploy
\`\`\`

## 🧪 Testing

### Run tests
\`\`\`bash
npm test
\`\`\`

### Test webhooks
\`\`\`bash
shopify app generate webhook
\`\`\`

## 🚀 Deployment

### Deploy to Shopify
\`\`\`bash
shopify app deploy
\`\`\`

### Deploy to Heroku
\`\`\`bash
git push heroku main
\`\`\`

## 📊 App Permissions

This app requires:
- \`read_products\`: Access product data
- \`write_products\`: Modify products
- \`read_customers\`: Access customer data

## 🔌 Webhooks

Configured webhooks:
- \`products/create\`
- \`products/update\`
- \`app/uninstalled\`

## 📁 Project Structure

\`\`\`
web/
├── frontend/         # React app with Polaris
├── api/             # Express API endpoints
├── webhooks/        # Webhook handlers
└── index.js         # Server entry point
extensions/          # Theme/checkout extensions
shopify.app.toml    # App configuration
\`\`\`

## 💰 Billing

This app uses Shopify's billing API for:
- Monthly subscription: $X.XX
- Usage-based charges (if applicable)

## 📄 License

This project is licensed under the MIT License.`,

    'huggingface-space': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 Tech Stack

- **Framework**: Gradio 5.7.1
- **ML Framework**: Transformers 4.47, PyTorch 2.5
- **Language**: Python 3.13
- **Deployment**: Hugging Face Spaces
- **Hardware**: CPU / GPU (T4/A10G)

## 📋 Prerequisites

- Python 3.13 or higher
- Hugging Face account
- Git with LFS support
- CUDA 12.6 (for local GPU development)

## 🛠️ Local Development

1. Clone the repository:
\`\`\`bash
git clone https://huggingface.co/spaces/{{HF_USERNAME}}/{{REPO_NAME}}
cd {{REPO_NAME}}
\`\`\`

2. Create virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

3. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Run locally:
\`\`\`bash
python app.py
\`\`\`

## 💻 Space Configuration

### Hardware Requirements
- **CPU**: Free tier, suitable for lightweight models
- **GPU**: T4/A10G for deep learning models

### Environment Variables
Set in Space settings:
- \`HF_TOKEN\`: For private model access
- \`API_KEY\`: For external API access

## 🤖 Model Information

- **Base Model**: [Model name and link]
- **Task**: [Classification/Generation/etc.]
- **Performance**: [Metrics]
- **Limitations**: [Known limitations]

## 📊 Usage

1. Navigate to the Space URL
2. Input your data
3. Click Submit
4. View results

### API Usage
\`\`\`python
import requests

response = requests.post(
    "https://{{HF_USERNAME}}-{{REPO_NAME}}.hf.space/run/predict",
    json={"data": ["your input text"]}
)
print(response.json())
\`\`\`

## 🧪 Testing

Run tests locally:
\`\`\`bash
pytest tests/
\`\`\`

## 🚀 Deployment

Push changes to deploy:
\`\`\`bash
git add .
git commit -m "Update model"
git push
\`\`\`

The Space will automatically rebuild.

## 📁 Project Structure

\`\`\`
├── app.py           # Gradio interface
├── model.py         # Model loading and inference
├── utils.py         # Helper functions
├── requirements.txt # Python dependencies
└── README.md       # Space card (this file)
\`\`\`

## 🎨 Customization

- Modify \`app.py\` to change the interface
- Update \`requirements.txt\` for new dependencies
- Edit Space settings for hardware/secrets

## 📄 License

This project is licensed under the MIT License.

## 🤝 Citation

If you use this Space in your research:
\`\`\`bibtex
@misc{{{PROJECT_NAME}},
  author = {CoreVecta},
  title = {{{PROJECT_NAME}}},
  year = {2025},
  publisher = {Hugging Face},
  url = {https://huggingface.co/spaces/{{HF_USERNAME}}/{{REPO_NAME}}}
}
\`\`\``
  };

  // Get the template-specific README
  const readmeTemplate = readmeTemplates[template] || readmeTemplates['web-app-nextjs'];
  
  // Process placeholders
  return readmeTemplate.replace(/{{([^}]+)}}/g, (match, key) => {
    switch (key) {
      case 'PROJECT_NAME':
        return projectData.title || 'Project';
      case 'PROJECT_DESCRIPTION':
        return projectData.description || projectData.problem || 'A modern application built with best practices.';
      case 'REPO_NAME':
        return projectData.repoName || projectData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project';
      case 'PACKAGE_NAME':
        return projectData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project';
      case 'HF_USERNAME':
        return 'corevecta';
      case 'CONTRACT_NAME':
        return projectData.title?.replace(/[^a-zA-Z0-9]/g, '') || 'Contract';
      case 'CLASS_NAME':
        return projectData.title?.replace(/[^a-zA-Z0-9]/g, '') || 'ClassName';
      case 'NAMESPACE':
        return projectData.title?.replace(/[^a-zA-Z0-9]/g, '') || 'Namespace';
      case 'PLUGIN_NAME':
        return projectData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'plugin';
      default:
        return match;
    }
  });
}

// Also create a generic fallback for any unlisted templates
export function generateGenericReadme(projectData: any): string {
  return `# ${projectData.title}

${projectData.description || projectData.problem}

## 🚀 Tech Stack

${projectData.technologyStack || 'Modern technology stack'}

## 📋 Prerequisites

${projectData.prerequisites || 'See installation instructions'}

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/corevecta-projects/${projectData.repoName || 'project'}.git
cd ${projectData.repoName || 'project'}
\`\`\`

2. Follow the setup instructions for your platform.

## 💻 Development

See the documentation for development instructions.

## 🧪 Testing

Run the test suite to ensure everything is working correctly.

## 📄 License

This project is licensed under the MIT License.`;
}