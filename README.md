# WorldSkills Station Allocation Generator

Generate reproducible and transparent station allocations for WorldSkills competitions using seeded randomization.

## Quick Start

1. **Clone or download** this repository
2. **Start a local web server** (required for localStorage):

```bash
# Recommended: VS Code Live Server extension (auto-selects available port)

# Or use Python (use any available port)
python3 -m http.server 8080

# Or use PHP
php -S localhost:8080

# Or use Node.js
npx http-server -p 8080
```

3. **Navigate to** setup.html (e.g. `http://localhost:8080/setup.html`)
4. **Download the sample template** and fill it with your competitor data
5. **Upload the competitors list** and configure branding colors
6. **Save configuration** - you'll be redirected to index.html
7. **Generate allocation** by entering seed values (3 words + 3 numbers)

## Features

- Reproducible allocations using seeded randomization
- Custom branding with gradient colors and logo upload
- Canvas-based color picker
- Export/Import configurations as JSON
- No external dependencies

## Usage

### Setup (setup.html)

1. Set gradient colors using the color picker
2. Upload competition logo (optional)
3. Upload competitor data (CSV or TXT)
4. Save configuration

### Generate Allocation (index.html)

1. Enter seed values (3 words + 3 numbers)
2. Click "Generate Allocation"
3. Save allocation as text file for records

The same seed always produces the same allocation - useful for reproducibility and transparency.

## File Format

Competitor files should be CSV or space-separated TXT:

```
John Smith UK
Maria Garcia ES
Ahmed Hassan EG
```

Download the sample template from the setup page.

## Technical Details

**Randomization Algorithm**: Mulberry32 PRNG with Fisher-Yates shuffle for deterministic, reproducible allocations.

---

**Developed and maintained by** [Val Adamescu](https://www.linkedin.com/in/valadamescu/)
