# Database Setup

## Quick Setup

1. **Create `.env.local` file** in the project root:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.hkirmyownguopeowribl.supabase.co:5432/postgres
```

Replace `YOUR_PASSWORD` with your actual Supabase database password.

2. **Restart your development server:**

```bash
npm run dev
```

## How It Works

When users complete a simulation:
1. Form data is submitted
2. Calculation engine processes it
3. **Results are automatically saved to `raport_zainteresowania` table**
4. User sees results page

## Data Mapping

| Application Field | Database Column |
|-------------------|-----------------|
| expectedPension | emerytura_oczekiwana |
| age | wiek |
| sex | plec |
| monthlyGross | wysokosc_wynagrodzenia |
| includeL4 | uwzglednial_okresy_choroby |
| accountBalance | wysokosc_srodkow |
| nominalPension | emerytura_rzeczywista |
| realPension | emerytura_urealniona |
| postalCode | kod_pocztowy |

## Timestamp Fields

The following fields are automatically set:
- `data_uzycia` - Current date (YYYY-MM-DD)
- `godzina_uzycia` - Current time (HH:MM:SS)

## API Endpoint

**POST** `/api/simulations`

Automatically called when user completes simulation form.

## Troubleshooting

### "DATABASE_URL environment variable is not set"
**Solution:** Create `.env.local` file with your database connection string

### Connection timeout or ENOTFOUND
**Solution:** 
1. Verify your database URL is correct in Supabase dashboard
2. Check your internet connection
3. Ensure Supabase project is active

### "Table raport_zainteresowania does not exist"
**Solution:** Run the CREATE TABLE SQL in your Supabase SQL editor

## Environment Variables

- `.env.local` - Your local environment variables (git-ignored)
- `.env.example` - Template file (committed to git)

**Never commit `.env.local` to git!**

