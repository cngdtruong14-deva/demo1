# Backend Scripts

## Seed Menu Script

### Usage

```bash
# Seed from default menu.json
node scripts/seed-menu.js

# Seed from custom menu file
node scripts/seed-menu.js ../docs/development/sample-data/menu-quannhautudo.json

# Seed to specific branch
node scripts/seed-menu.js ../docs/development/sample-data/menu.json <branch-uuid>
```

### Environment Variables

The script uses the same database configuration as the main application:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 3306)
- `DB_USER` (default: root)
- `DB_PASSWORD` (default: rootpassword)
- `DB_NAME` (default: qr_order_db)

### Process

1. Connects to MySQL database
2. Creates or uses existing branch
3. Inserts categories first (required for products)
4. Inserts products with proper foreign key relationships
5. Handles duplicate entries (updates existing records)

### Output

The script provides detailed logging:
- Connection status
- Number of categories/products processed
- Success/error counts
- Final summary

