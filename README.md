# 🎲 Pocket Dicemancer

![Pocket Dicemancer](https://imgix.cosmicjs.com/7da0c330-032f-11f1-a2df-291d40c8fca1-photo-1577493340887-b7bfff550145-1770363792776.jpg?w=1200&h=300&fit=crop&auto=format,compress)

A fully playable turn-based dice battler web game powered by [Cosmic](https://www.cosmicjs.com/docs). All game data — dice, elements, enemies — is CMS-driven and tunable from your Cosmic dashboard.

## Features

- 🎲 **Complete Dice Combat** — Conveyor system, inventory management, Yahtzee-style rerolling
- 🔥 **7 Elemental Effects** — Fire, Ice, Poison, Lightning, Burn, Heal, Stun with unique mechanics
- 👹 **CMS-Driven Enemies** — 8 enemy types with images, stats, and special abilities from Cosmic
- 🏰 **Dungeon Progression** — Floor-based scaling with boss fights every 5 floors
- 🎯 **Color Matching Combos** — Up to +100% damage bonus for 5-of-a-kind
- ⭐ **Reroll Token Economy** — Strategic resource management for crucial rolls
- 📖 **Bestiary & Codex** — Browse all game content loaded from Cosmic CMS
- 📱 **Mobile-First Design** — Portrait layout with touch-friendly controls

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=69859936c8c4b2550dcce606&clone_repository=69859d6fc8c4b2550dcce8b7)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "# Pocket Dicemancer - Game Design Document
>
> ## Core Concept
> A turn-based dice battler combining inventory management, color matching combos, and Yahtzee-style rerolling. Fight through procedurally generated dungeons by strategically storing, combining, and rolling colored dice with different elemental effects.
>
> ---
>
> ## Visual Layout
>
> ```
> ┌─────────────────────────────────────┐
> │  ENEMY (HP bar, attack timer)       │
> ├─────────────────────────────────────┤
> │                                     │
> │  BATTLE AREA (effects/animations)   │
> │                                     │
> ├─────────────────────────────────────┤
> │  CONVEYOR (left → right)            │
> │  [🎲] [🎲] [🎲] → → →               │
> ├─────────────────────────────────────┤
> │  INVENTORY (storage area)           │
> │  [🎲] [🎲] [🎲] [🎲] [🎲] [🎲]      │
> ├─────────────────────────────────────┤
> │  REROLL TOKENS: ⭐⭐⭐              │
> └─────────────────────────────────────┘
> ```
>
> ## Turn Structure
>
> ### 1. Advance Phase (Automatic)
> - New random die appears on conveyor (left side)
> - Conveyor shifts right one position
> - Rightmost die falls off if not grabbed
>
> ### 2. Store Phase (Optional, Free Action)
> - Player can drag dice from conveyor to inventory
> - **If player stores:** can only roll from inventory this turn
> - **If player doesn't store:** can roll from conveyor (with boost)
> - Multiple dice can be stored if there's space
>
> ### 3. Combine/Discard Phase (Free Actions)
> - Organize inventory
> - Discard dice to earn bonus rerolls (1 die = 1 reroll token)
> - Group dice by color (visual organization, not merging)
>
> ### 4. Roll Phase (Choose ONE)
>
> **Option A: Roll from Inventory**
> - Select dice from inventory to roll
> - Roll all selected dice simultaneously
> - Get 2 free rerolls (can hold specific dice, reroll others)
> - Can spend bonus reroll tokens for extra rerolls
> - Yahtzee-style: hold and reroll until satisfied or out of rerolls
>
> **Option B: Roll from Conveyor (Boosted)**
> - Only available if you didn't store this turn
> - Take current conveyor die and roll it
> - Gets **2x power boost**
> - Single use (die is consumed)
> - Still gets 2 free rerolls
>
> **Option C: Skip Turn**
> - Don't roll at all
> - Earn 2 bonus reroll tokens
> - Enemy timer still advances
>
> ### 5. Resolution Phase
> - Damage/effects applied to enemy or player
> - Enemy attacks if their timer is up
> - Enemy timer advances by 1
>
> ## Dice System, Color Matching, Inventory, Resource Economy, Enemy System, Combat Mechanics, Progression & Replayability, UI/UX Details, Reroll Mechanics, Game Modes, Technical Considerations, Balance Considerations — all fully detailed in the game design document."

### Code Generation Prompt

> "Based on the content model I created for Pocket Dicemancer Game Design Document, now build a complete web application that showcases this content. Include a modern, responsive design with proper navigation, content display, and user-friendly interface."

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies

- [Next.js 16](https://nextjs.org/) — React framework with App Router
- [React 19](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS 3](https://tailwindcss.com/) — Utility-first styling
- [Cosmic](https://www.cosmicjs.com/docs) — Headless CMS for game data
- [@cosmicjs/sdk](https://www.npmjs.com/package/@cosmicjs/sdk) — Cosmic JavaScript SDK

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) runtime installed
- A Cosmic account with the Pocket Dicemancer bucket

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pocket-dicemancer

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Cosmic credentials

# Run development server
bun dev
```

### Environment Variables

```
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

## Cosmic SDK Examples

```typescript
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Fetch all dice definitions
const { objects: dice } = await cosmic.objects
  .find({ type: 'dice-definitions' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1)

// Fetch all enemy types
const { objects: enemies } = await cosmic.objects
  .find({ type: 'enemy-types' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1)

// Fetch all element effects
const { objects: elements } = await cosmic.objects
  .find({ type: 'element-effects' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1)
```

## Cosmic CMS Integration

This application uses three Cosmic object types:

| Object Type | Count | Purpose |
|------------|-------|---------|
| **Dice Definitions** | 10 | Element, tier, face values, emoji, special effects |
| **Element Effects** | 7 | Damage %, DoT mechanics, special abilities |
| **Enemy Types** | 8 | HP, damage, attack timer, boss flag, images |

All game balance can be tuned directly from the Cosmic dashboard without code changes.

## Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Netlify
1. Push your code to GitHub
2. Import into [Netlify](https://netlify.com)
3. Add environment variables in site settings
4. Deploy

<!-- README_END -->