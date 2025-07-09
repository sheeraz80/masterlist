# Encrypted Notes - Obsidian Plugin Features

## Core Features
- Note-Level Encryption: Encrypt individual notes with a unique password.
- Strong Encryption: Uses industry-standard AES-256 encryption.
- In-Editor Decryption: When a user opens an encrypted note, a password prompt appears. Entering the correct password decrypts and displays the content for that session.
- Auto-Lock: Automatically re-encrypts the note when it's closed or after a period of inactivity.
- Frontmatter Exclusion: Keeps the note's frontmatter (metadata) unencrypted so it can still be used by plugins like Dataview.

## Platform-Specific Capabilities
This implementation leverages the unique capabilities of the Obsidian Plugin platform:

### API Integration
- Access to platform-specific APIs
- Native integration with platform ecosystem

### User Experience
- Follows platform design guidelines
- Optimized for platform-specific workflows

### Performance
- Optimized for platform performance characteristics
- Efficient resource utilization
