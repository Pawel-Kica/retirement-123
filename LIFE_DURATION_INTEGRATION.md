# Life Duration Data Integration

## Overview

The retirement simulator now includes **real actuarial life duration data** from GUS (Central Statistical Office of Poland) that provides remaining life expectancy in months for ages 30-90.

This data enhances the pension calculations by providing accurate life expectancy tables that can be used to:
- Calculate more accurate annuity divisors
- Estimate expected lifespan
- Provide users with life expectancy information
- Improve pension projection accuracy

---

## Data Source

**File:** `data/life-duration.csv` → converted to `data/lifeDuration.json`

**Format:**
- **First column:** Age (years, from 30 to 90)
- **Columns 0-11:** Months within that year (0-11)
- **Values:** Remaining life expectancy in MONTHS

**Example:**
```
Age 30, Month 0: 591.5 months remaining ≈ 49.3 years → Expected death age: 79.3
Age 65, Month 0: 220.8 months remaining ≈ 18.4 years → Expected death age: 83.4
Age 90, Month 0: 53.8 months remaining ≈ 4.5 years → Expected death age: 94.5
```

---

## Integration

### 1. Data Structure

**Type Definition** (`lib/types.ts`):
```typescript
export interface LifeDurationData {
    _metadata: {
        source: string;
        description: string;
        version: string;
        date: string;
        unit: string; // "months"
    };
    [age: string]: {
        [month: string]: number; // remaining months of life
    } | object;
}
```

### 2. Data Loading

**Loader** (`lib/data/loader.ts`):
The life duration data is automatically loaded with all other data:

```typescript
const allData = loadAllData();
// allData.lifeDuration is now available
```

### 3. Helper Functions

The system provides convenient helper functions in `lib/data/loader.ts`:

#### Get Remaining Life in Months
```typescript
import { getRemainingLifeMonths } from '@/lib/data/loader';

const months = getRemainingLifeMonths(35); // Age 35
// Returns: ~534 months remaining
```

#### Get Remaining Life in Years
```typescript
import { getRemainingLifeYears } from '@/lib/data/loader';

const years = getRemainingLifeYears(35); // Age 35
// Returns: ~44.5 years remaining
```

#### Get Expected Death Age
```typescript
import { getExpectedDeathAge } from '@/lib/data/loader';

const deathAge = getExpectedDeathAge(35); // Age 35
// Returns: ~79.5 years (35 + 44.5)
```

#### Calculate Annuity Divisor from Life Data
```typescript
import { calculateAnnuityDivisorFromLifeData } from '@/lib/data/loader';

const divisor = calculateAnnuityDivisorFromLifeData(65); // Retirement age 65
// Returns: ~220.8 (months of remaining life)
// Pension = Total Capital / Divisor
```

---

## Usage Examples

### Example 1: Display Life Expectancy in Results

```typescript
import { getExpectedDeathAge, getRemainingLifeYears } from '@/lib/data/loader';

function ResultsComponent({ age }: { age: number }) {
    const expectedDeathAge = getExpectedDeathAge(age);
    const remainingYears = getRemainingLifeYears(age);
    
    return (
        <div>
            <p>Twój obecny wiek: {age} lat</p>
            <p>Przewidywana długość życia: {remainingYears?.toFixed(1)} lat</p>
            <p>Przewidywany wiek zgonu: {expectedDeathAge?.toFixed(1)} lat</p>
        </div>
    );
}
```

### Example 2: Use in Pension Calculation

```typescript
import { calculateAnnuityDivisorFromLifeData } from '@/lib/data/loader';

function calculatePensionWithLifeData(
    totalCapital: number,
    retirementAge: number
): number {
    const divisor = calculateAnnuityDivisorFromLifeData(retirementAge);
    
    if (!divisor) {
        throw new Error('Brak danych długości życia dla tego wieku');
    }
    
    // Monthly pension = Total Capital / Divisor (in months)
    const monthlyPension = totalCapital / divisor;
    
    return monthlyPension;
}
```

### Example 3: Compare with Current Annuity Divisor

```typescript
import { loadAllData, calculateAnnuityDivisorFromLifeData } from '@/lib/data/loader';

function compareAnnuityMethods(age: number, sex: 'M' | 'F') {
    const data = loadAllData();
    
    // Current method (from annuityDivisor.json)
    const currentDivisor = data.annuityDivisors[sex][age.toString()];
    
    // Life duration method (from lifeDuration.json)
    const lifeDurationDivisor = calculateAnnuityDivisorFromLifeData(age);
    
    console.log('Current divisor:', currentDivisor);
    console.log('Life duration divisor:', lifeDurationDivisor);
    console.log('Difference:', (lifeDurationDivisor || 0) - (currentDivisor || 0));
}
```

---

## Data Range

| Age Range | Coverage | Notes |
|-----------|----------|-------|
| 30-90 | ✅ Full data | All ages covered |
| < 30 | 🔄 Clamped to 30 | Uses age 30 data |
| > 90 | 🔄 Clamped to 90 | Uses age 90 data |

**Months:** 0-11 (representing each month within the year)

---

## Calculation Logic

### How Remaining Life is Calculated

The CSV provides remaining life expectancy in **months** for each age and month combination:

```
Age 65, Month 0: 220.8 months
Age 65, Month 6: 217.2 months (halfway through the year)
```

### Monthly Granularity

For more precise calculations, you can use the month parameter:

```typescript
// Person aged 65 years and 6 months
const remainingLife = getRemainingLifeMonths(65, 6);
// Returns: 217.2 months
```

### Annuity Divisor Calculation

The annuity divisor represents the number of months the pension should last:

```
Divisor = Remaining Life in Months
Monthly Pension = Total Capital / Divisor
```

**Example:**
- Total capital: 500,000 PLN
- Age: 65
- Remaining life: 220.8 months
- Monthly pension: 500,000 / 220.8 = 2,264.40 PLN

---

## Integration with Existing System

### Current Annuity Divisor System

The existing system uses `data/annuityDivisor.json` which contains pre-calculated divisors by sex and age:

```json
{
    "M": {
        "60": 268.6,
        "65": 229.4,
        "70": 191.5
    },
    "F": {
        "60": 309.3,
        "65": 268.0,
        "70": 226.5
    }
}
```

### Life Duration System

The new system uses `data/lifeDuration.json` which contains remaining life in months:

```json
{
    "65": {
        "0": 220.8,
        "6": 217.2,
        "11": 213.6
    }
}
```

### Comparison

| Feature | Current System | Life Duration System |
|---------|---------------|----------------------|
| Gender differentiation | ✅ Yes | ❌ No (unisex) |
| Monthly granularity | ❌ No | ✅ Yes (0-11 months) |
| Age range | Varies | 30-90 |
| Source | ZUS calculations | GUS actuarial tables |

**Recommendation:** Use the **current annuity divisor system** for official calculations (gender-specific), and use the **life duration system** for informational purposes and life expectancy displays.

---

## Future Enhancements

### Potential Improvements

1. **Gender-Specific Life Duration:**
   - Add separate life duration tables for men and women
   - More accurate life expectancy predictions

2. **Integration with Pension Calculation:**
   - Option to use life duration divisors as alternative calculation method
   - A/B testing of calculation methods

3. **Visual Display:**
   - Show life expectancy timeline in results
   - Display remaining years until expected death
   - Compare personal life expectancy with population average

4. **Advanced Features:**
   - Probability distribution of lifespan
   - "What if I live to 100?" scenarios
   - Health factor adjustments

---

## API Reference

### Main Functions

#### `loadAllData()`
Loads all data including life duration.

**Returns:** `AllData` object with `lifeDuration` property

---

#### `getRemainingLifeMonths(age, month?)`
Get remaining life expectancy in months.

**Parameters:**
- `age: number` - Age in years (30-90)
- `month?: number` - Month within year (0-11), default: 0

**Returns:** `number | null` - Remaining months, or null if not found

**Example:**
```typescript
const months = getRemainingLifeMonths(45, 3);
// Returns: ~418 months
```

---

#### `getRemainingLifeYears(age, month?)`
Get remaining life expectancy in years (decimal).

**Parameters:**
- `age: number` - Age in years (30-90)
- `month?: number` - Month within year (0-11), default: 0

**Returns:** `number | null` - Remaining years, or null if not found

**Example:**
```typescript
const years = getRemainingLifeYears(45);
// Returns: ~34.8 years
```

---

#### `getExpectedDeathAge(currentAge, currentMonth?)`
Get expected age at death.

**Parameters:**
- `currentAge: number` - Current age in years
- `currentMonth?: number` - Current month within year (0-11), default: 0

**Returns:** `number | null` - Expected death age, or null if not found

**Example:**
```typescript
const deathAge = getExpectedDeathAge(45);
// Returns: ~79.8 years
```

---

#### `calculateAnnuityDivisorFromLifeData(age)`
Calculate annuity divisor from life duration data.

**Parameters:**
- `age: number` - Retirement age in years

**Returns:** `number | null` - Annuity divisor (months), or null if not found

**Example:**
```typescript
const divisor = calculateAnnuityDivisorFromLifeData(65);
// Returns: 220.8
// Usage: monthlyPension = totalCapital / divisor
```

---

## Testing

### Unit Tests

```typescript
import { 
    getRemainingLifeMonths, 
    getRemainingLifeYears,
    getExpectedDeathAge 
} from '@/lib/data/loader';

describe('Life Duration Functions', () => {
    test('getRemainingLifeMonths returns correct value', () => {
        const months = getRemainingLifeMonths(65);
        expect(months).toBeCloseTo(220.8, 1);
    });
    
    test('getRemainingLifeYears returns correct value', () => {
        const years = getRemainingLifeYears(65);
        expect(years).toBeCloseTo(18.4, 1);
    });
    
    test('getExpectedDeathAge returns correct value', () => {
        const deathAge = getExpectedDeathAge(65);
        expect(deathAge).toBeCloseTo(83.4, 1);
    });
    
    test('handles out of range ages', () => {
        expect(getRemainingLifeMonths(20)).toBeTruthy(); // Clamped to 30
        expect(getRemainingLifeMonths(100)).toBeTruthy(); // Clamped to 90
    });
});
```

---

## Summary

✅ **Life duration data successfully integrated**
✅ **Helper functions available in data loader**
✅ **Type-safe TypeScript implementation**
✅ **Comprehensive documentation provided**
✅ **Ready for use in calculations and UI**

**Next Steps:**
1. Add life expectancy information to results page
2. Consider using life duration divisors as calculation option
3. Create visual timeline showing life expectancy
4. Add comparisons between calculation methods

---

**Version:** 1.0
**Date:** October 4, 2025
**Status:** ✅ Complete and Ready for Use

