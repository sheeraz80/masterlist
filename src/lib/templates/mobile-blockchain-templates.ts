/**
 * Mobile and Blockchain platform templates
 */

export const MOBILE_BLOCKCHAIN_TEMPLATES = {
  // iOS App Template (Swift/SwiftUI)
  'ios-app': {
    'Package.swift': {
      content: `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "{{PACKAGE_NAME}}",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "{{PACKAGE_NAME}}",
            targets: ["{{PACKAGE_NAME}}"]
        ),
    ],
    dependencies: [
        // Add your dependencies here
    ],
    targets: [
        .target(
            name: "{{PACKAGE_NAME}}",
            dependencies: []
        ),
        .testTarget(
            name: "{{PACKAGE_NAME}}Tests",
            dependencies: ["{{PACKAGE_NAME}}"]
        ),
    ]
)`
    },
    '{{PACKAGE_NAME}}/ContentView.swift': {
      content: `import SwiftUI

struct ContentView: View {
    @State private var isActive = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("{{PROJECT_NAME}}")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("{{PROJECT_DESCRIPTION}}")
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                Spacer()
                
                Button(action: {
                    isActive.toggle()
                }) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .navigationTitle("Welcome")
        }
    }
}

#Preview {
    ContentView()
}`
    },
    '{{PACKAGE_NAME}}/{{PACKAGE_NAME}}App.swift': {
      content: `import SwiftUI

@main
struct {{PACKAGE_NAME}}App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}`
    },
    'README.md': {
      content: `# {{PROJECT_NAME}} - iOS App

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## Installation

### Swift Package Manager

\`\`\`swift
dependencies: [
    .package(url: "{{REPO_URL}}", from: "1.0.0")
]
\`\`\`

### Manual Installation

1. Clone the repository
2. Open \`{{PACKAGE_NAME}}.xcodeproj\` in Xcode
3. Build and run the project

## Development

1. Install Xcode from the App Store
2. Clone this repository
3. Open the project in Xcode
4. Select your development team in project settings
5. Build and run on simulator or device

## Architecture

This app follows the MVVM (Model-View-ViewModel) architecture pattern with SwiftUI.

## Testing

Run tests using:
\`\`\`bash
swift test
\`\`\`

Or in Xcode: Product → Test (⌘U)

## Distribution

1. Archive the app in Xcode
2. Upload to App Store Connect
3. Submit for review

## License

MIT - CoreVecta LLC`
    }
  },

  // Android App Template (Kotlin)
  'android-app': {
    'build.gradle.kts': {
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.corevecta.{{PACKAGE_NAME}}"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.corevecta.{{PACKAGE_NAME}}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
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
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.0")
    implementation(platform("androidx.compose:compose-bom:2023.08.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}`
    },
    'app/src/main/java/com/corevecta/{{PACKAGE_NAME}}/MainActivity.kt': {
      content: `package com.corevecta.{{PACKAGE_NAME}}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.corevecta.{{PACKAGE_NAME}}.ui.theme.{{PACKAGE_NAME}}Theme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            {{PACKAGE_NAME}}Theme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }
}

@Composable
fun MainScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "{{PROJECT_NAME}}",
            style = MaterialTheme.typography.headlineLarge,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "{{PROJECT_DESCRIPTION}}",
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = { /* TODO: Implement action */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Get Started")
        }
    }
}`
    },
    'app/src/main/AndroidManifest.xml': {
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.{{PACKAGE_NAME}}"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.{{PACKAGE_NAME}}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
    }
  },

  // React Native App Template
  'react-native-app': {
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '0.0.1',
        private: true,
        scripts: {
          android: 'react-native run-android',
          ios: 'react-native run-ios',
          lint: 'eslint .',
          start: 'react-native start',
          test: 'jest'
        },
        dependencies: {
          'react': '18.2.0',
          'react-native': '0.73.0',
          '@react-navigation/native': '^6.1.0',
          '@react-navigation/native-stack': '^6.9.0',
          'react-native-safe-area-context': '^4.8.0',
          'react-native-screens': '^3.29.0'
        },
        devDependencies: {
          '@babel/core': '^7.20.0',
          '@babel/preset-env': '^7.20.0',
          '@babel/runtime': '^7.20.0',
          '@react-native/babel-preset': '0.73.0',
          '@react-native/eslint-config': '0.73.0',
          '@react-native/metro-config': '0.73.0',
          '@react-native/typescript-config': '0.73.0',
          '@types/react': '^18.2.0',
          '@types/react-test-renderer': '^18.0.0',
          'babel-jest': '^29.0.0',
          'eslint': '^8.0.0',
          'jest': '^29.0.0',
          'react-test-renderer': '18.2.0',
          'typescript': '^5.0.0'
        }
      }
    },
    'App.tsx': {
      content: `import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text style={styles.title}>{{PROJECT_NAME}}</Text>
          <Text style={styles.description}>{{PROJECT_DESCRIPTION}}</Text>
          
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Features:</Text>
            <Text style={styles.featuresList}>{{FEATURES_LIST}}</Text>
          </View>
          
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  features: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featuresList: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;`
    }
  },

  // Ethereum Smart Contract Template
  'ethereum-contract': {
    'hardhat.config.js': {
      content: `require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};`
    },
    'contracts/{{PACKAGE_NAME}}.sol': {
      content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title {{PROJECT_NAME}}
 * @dev {{PROJECT_DESCRIPTION}}
 * @custom:security-contact security@corevecta.com
 */
contract {{PACKAGE_NAME}} is Ownable, ReentrancyGuard, Pausable {
    // State variables
    uint256 public constant VERSION = 1;
    
    // Events
    event ActionPerformed(address indexed user, uint256 value, uint256 timestamp);
    
    // Errors
    error InvalidAmount();
    error Unauthorized();
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Main function to interact with the contract
     * @param _value The value to process
     */
    function performAction(uint256 _value) external nonReentrant whenNotPaused {
        if (_value == 0) revert InvalidAmount();
        
        // Your contract logic here
        
        emit ActionPerformed(msg.sender, _value, block.timestamp);
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw funds (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}`
    },
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        scripts: {
          compile: 'hardhat compile',
          test: 'hardhat test',
          'test:coverage': 'hardhat coverage',
          deploy: 'hardhat run scripts/deploy.js',
          'deploy:sepolia': 'hardhat run scripts/deploy.js --network sepolia',
          verify: 'hardhat verify',
          clean: 'hardhat clean'
        },
        devDependencies: {
          '@nomicfoundation/hardhat-toolbox': '^4.0.0',
          '@openzeppelin/contracts': '^5.0.0',
          'dotenv': '^16.0.0',
          'hardhat': '^2.19.0'
        }
      }
    },
    'test/{{PACKAGE_NAME}}.test.js': {
      content: `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("{{PROJECT_NAME}}", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("{{PACKAGE_NAME}}");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should have the correct version", async function () {
      expect(await contract.VERSION()).to.equal(1);
    });
  });

  describe("Core Functions", function () {
    it("Should perform action correctly", async function () {
      await expect(contract.performAction(100))
        .to.emit(contract, "ActionPerformed")
        .withArgs(owner.address, 100, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should reject zero value", async function () {
      await expect(contract.performAction(0))
        .to.be.revertedWithCustomError(contract, "InvalidAmount");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to pause", async function () {
      await contract.pause();
      expect(await contract.paused()).to.equal(true);
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(contract.connect(addr1).pause())
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });
});`
    }
  },

  // Solana Program Template
  'solana-program': {
    'Cargo.toml': {
      content: `[package]
name = "{{PACKAGE_NAME}}"
version = "0.1.0"
edition = "2021"

[dependencies]
solana-program = "1.17"
borsh = "0.10"
borsh-derive = "0.10"
thiserror = "1.0"

[dev-dependencies]
solana-program-test = "1.17"
solana-sdk = "1.17"
tokio = { version = "1", features = ["full"] }

[lib]
crate-type = ["cdylib", "lib"]
name = "{{PACKAGE_NAME}}"

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1

[profile.dev]
overflow-checks = false`
    },
    'src/lib.rs': {
      content: `use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare the program ID
solana_program::declare_id!("11111111111111111111111111111111");

// Define the instruction data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum {{PACKAGE_NAME}}Instruction {
    Initialize { data: u64 },
    Process { amount: u64 },
}

// Define the state structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct {{PACKAGE_NAME}}State {
    pub is_initialized: bool,
    pub data: u64,
    pub authority: Pubkey,
}

// Program entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("{{PROJECT_NAME}} entrypoint");
    
    let instruction = {{PACKAGE_NAME}}Instruction::try_from_slice(instruction_data)?;
    
    match instruction {
        {{PACKAGE_NAME}}Instruction::Initialize { data } => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts, data)
        }
        {{PACKAGE_NAME}}Instruction::Process { amount } => {
            msg!("Instruction: Process");
            process_action(program_id, accounts, amount)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let state_account = next_account_info(account_info_iter)?;
    let authority = next_account_info(account_info_iter)?;
    
    // Verify account ownership
    if state_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Initialize state
    let mut state = {{PACKAGE_NAME}}State::try_from_slice(&state_account.data.borrow())?;
    
    if state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    state.is_initialized = true;
    state.data = data;
    state.authority = *authority.key;
    
    state.serialize(&mut &mut state_account.data.borrow_mut()[..])?;
    
    msg!("State initialized with data: {}", data);
    Ok(())
}

fn process_action(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let state_account = next_account_info(account_info_iter)?;
    let authority = next_account_info(account_info_iter)?;
    
    // Verify account ownership
    if state_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Load and verify state
    let mut state = {{PACKAGE_NAME}}State::try_from_slice(&state_account.data.borrow())?;
    
    if !state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    if state.authority != *authority.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Process the action
    state.data = state.data.saturating_add(amount);
    
    state.serialize(&mut &mut state_account.data.borrow_mut()[..])?;
    
    msg!("Processed amount: {}, new total: {}", amount, state.data);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_instruction_serialization() {
        let init = {{PACKAGE_NAME}}Instruction::Initialize { data: 42 };
        let serialized = init.try_to_vec().unwrap();
        let deserialized = {{PACKAGE_NAME}}Instruction::try_from_slice(&serialized).unwrap();
        
        match deserialized {
            {{PACKAGE_NAME}}Instruction::Initialize { data } => assert_eq!(data, 42),
            _ => panic!("Wrong instruction type"),
        }
    }
}`
    }
  },

  // Hugging Face Space Template
  'huggingface-space': {
    'app.py': {
      content: `import gradio as gr
import numpy as np
from typing import Optional, Tuple
import time

# {{PROJECT_NAME}} - {{PROJECT_DESCRIPTION}}

def process_input(text_input: str, number_input: float) -> Tuple[str, str]:
    """
    Main processing function for the Gradio app.
    
    Args:
        text_input: User's text input
        number_input: Numeric parameter
        
    Returns:
        Tuple of (result, analysis)
    """
    # Simulate processing
    time.sleep(0.5)
    
    # Your ML/AI logic here
    result = f"Processed: {text_input}"
    analysis = f"Analysis complete with parameter: {number_input}"
    
    return result, analysis

# Create the Gradio interface
with gr.Blocks(title="{{PROJECT_NAME}}") as demo:
    gr.Markdown(
        """
        # {{PROJECT_NAME}}
        
        {{PROJECT_DESCRIPTION}}
        
        ## Features
        {{FEATURES_LIST}}
        """
    )
    
    with gr.Row():
        with gr.Column():
            text_input = gr.Textbox(
                label="Input Text",
                placeholder="Enter your text here...",
                lines=3
            )
            number_input = gr.Slider(
                minimum=0,
                maximum=100,
                value=50,
                label="Parameter",
                info="Adjust this parameter to control the processing"
            )
            submit_btn = gr.Button("Process", variant="primary")
            
        with gr.Column():
            output_result = gr.Textbox(
                label="Result",
                lines=3,
                interactive=False
            )
            output_analysis = gr.Textbox(
                label="Analysis",
                lines=3,
                interactive=False
            )
    
    # Connect the processing function
    submit_btn.click(
        fn=process_input,
        inputs=[text_input, number_input],
        outputs=[output_result, output_analysis]
    )
    
    # Add examples
    gr.Examples(
        examples=[
            ["Sample text for processing", 30],
            ["Another example input", 70],
        ],
        inputs=[text_input, number_input]
    )
    
    gr.Markdown(
        """
        ---
        Created by [CoreVecta LLC](https://corevecta.com) | 
        [GitHub]({{REPO_URL}})
        """
    )

# Launch the app
if __name__ == "__main__":
    demo.launch()`
    },
    'requirements.txt': {
      content: `gradio>=4.0.0
numpy>=1.24.0
pandas>=2.0.0
torch>=2.0.0
transformers>=4.35.0
pillow>=10.0.0
scipy>=1.10.0
scikit-learn>=1.3.0`
    },
    'README.md': {
      content: `---
title: {{PROJECT_NAME}}
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.19.0
app_file: app.py
pinned: false
license: mit
---

# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Features

{{FEATURES_LIST}}

## How to Use

1. Visit the [Space](https://huggingface.co/spaces/corevecta/{{PACKAGE_NAME}})
2. Enter your input in the text field
3. Adjust parameters as needed
4. Click "Process" to see results

## Local Development

\`\`\`bash
# Clone the repository
git clone {{REPO_URL}}

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
\`\`\`

## API Usage

You can also use this Space via the Gradio API:

\`\`\`python
from gradio_client import Client

client = Client("corevecta/{{PACKAGE_NAME}}")
result = client.predict(
    text_input="Your text here",
    number_input=50,
    api_name="/predict"
)
print(result)
\`\`\`

## Model Information

- **Framework**: PyTorch / Transformers
- **License**: MIT
- **Author**: CoreVecta LLC

## Citation

If you use this in your research, please cite:

\`\`\`bibtex
@misc{{{PACKAGE_NAME}},
  title={{PROJECT_NAME}},
  author={CoreVecta LLC},
  year={2024},
  publisher={Hugging Face}
}
\`\`\`

## Support

Created by [CoreVecta LLC](https://corevecta.com)`
    }
  }
};