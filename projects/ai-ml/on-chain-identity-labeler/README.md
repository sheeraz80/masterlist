# On-Chain Identity Labeler

## Overview
**Problem Statement:** Block explorers show wallet addresses as long strings of characters, making it impossible to know who owns them. It's useful to see labels for known entities like exchanges, DeFi protocols, or famous investors.

**Solution:** A browser extension that enhances block explorers like Etherscan by adding human-readable labels to known addresses.

**Target Users:** All crypto users who use block explorers.

## Quality Score
**Overall Score:** 5.5/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 0/10
- **Technical Feasibility:** 8/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Crypto Browser Tools](./platforms/crypto-browser-tools/)

## Revenue Model
Free (community-driven).

## Revenue Potential
N/A.

## Development Time


## Technical Complexity
3/10. The extension would use a public, community-maintained database (e.g., a GitHub repo) of known addresses and their labels. A content script then scans the block explorer page and replaces or annotates addresses with their corresponding labels.

## Competition Level
Medium. Etherscan has its own labeling feature, but it's not comprehensive. Nansen is a paid platform that provides extensive wallet labels. A free, community-sourced alternative would be popular.

## Key Features
- Address Labeling: Shows labels like "Coinbase 7," "Vitalik Buterin," or "Uniswap V3 Router" next to addresses.
- Community-Sourced: The list of labels is open-source and maintained by the community.
- Color Coding: Assigns different colors to different types of labels (e.g., green for exchanges, blue for DeFi protocols).
- Hover for Details: Hovering over a label shows more information about the entity.

## Success Indicators
Number of downloads and becoming the community standard for address labeling.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
