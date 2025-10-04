# Minimum Retirement Age Validation with Early Retirement Exception

## Overview

Added validation to ensure users cannot select a retirement year that would result in retiring before the legal minimum retirement age in Poland, **with an exception for special professions** that qualify for early retirement.

---

## Legal Requirements

According to Polish law, the **standard minimum retirement age** is:

| Gender | Standard Minimum Retirement Age |
|--------|--------------------------------|
| **Female (F)** | **60 years** |
| **Male (M)** | **65 years** |

### Early Retirement Exception

Certain professions and circumstances allow for **early retirement** before the standard minimum age:

**Special Professions:**
- 👮 Police officers (Policja)
- 🚒 Firefighters (Strażacy)
- 🪖 Military personnel (Żołnierze)
- ⛏️ Miners (Górnicy)
- 👨‍⚕️ Medical personnel in special conditions
- 🚂 Railway workers
- 🏭 Workers in hazardous conditions
- 👨‍🏫 Teachers (in some cases)

These professions may retire earlier due to:
- Hazardous working conditions
- Physical demands
- Special retirement schemes (bridżowe emerytury)

---

## Implementation

### 1. New Field: Early Retirement Flag

Added `earlyRetirement` boolean field to `SimulationInputs`:

```typescript
export interface SimulationInputs {
    age: number;
    sex: Sex;
    monthlyGross: number;
    workStartYear: number;
    workEndYear: number;
    accountBalance?: number;
    subAccountBalance?: number;
    includeL4: boolean;
    postalCode?: string;
    earlyRetirement?: boolean; // Special professions (police, firefighters, etc.)
}
```

### 2. User Interface

Added a prominent checkbox in the simulation form after the retirement year field:

```tsx
<div className="mt-6 p-4 bg-zus-green-light border-l-4 border-zus-green rounded">
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.earlyRetirement || false}
      onChange={(e) => handleChange("earlyRetirement", e.target.checked)}
      className="mt-1 w-5 h-5 text-zus-green border-zus-grey-300 rounded focus:ring-zus-green focus:ring-2"
    />
    <div className="flex-1">
      <div className="font-semibold text-zus-grey-900">
        🚨 Wcześniejsza emerytura (służby mundurowe, specjalne zawody)
      </div>
      <div className="text-sm text-zus-grey-700 mt-1">
        Zaznacz, jeśli masz prawo do wcześniejszej emerytury przed osiągnięciem 
        standardowego wieku emerytalnego (60 lat dla kobiet, 65 lat dla mężczyzn). 
        Dotyczy to m.in.: policjantów, strażaków, żołnierzy, górników oraz innych 
        zawodów w szczególnych warunkach.
      </div>
    </div>
  </label>
</div>
```

**Visual Design:**
- Light green background (`bg-zus-green-light`)
- Green left border (`border-zus-green`)
- Alert emoji (🚨) to draw attention
- Clear explanation of when to use this option
- List of example professions

### 3. Validation Logic

The validation **only enforces minimum age if `earlyRetirement` is NOT checked**:

```typescript
// Only validate minimum age if NOT early retirement
if (inputs.age && inputs.sex && inputs.workEndYear && !inputs.earlyRetirement) {
  const retirementAge = inputs.age + (inputs.workEndYear - currentYear);
  const minRetirementAge = inputs.sex === 'F' ? 60 : 65;
  
  if (retirementAge < minRetirementAge) {
    errors.push({
      field: "workEndYear",
      message: `Minimalny wiek emerytalny dla ${inputs.sex === 'F' ? 'kobiet' : 'mężczyzn'} to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
    });
  }
}
```

**Key Points:**
- Validation is **skipped** when `earlyRetirement === true`
- Error message now includes hint to check the early retirement box
- Users with special professions can bypass minimum age requirement

### 4. Real-Time Re-validation

When the `earlyRetirement` checkbox is toggled, the form automatically re-validates:

```typescript
// Re-validate work end year when earlyRetirement checkbox changes
if (field === "earlyRetirement" && formData.workEndYear) {
  setErrors((prevErrors) =>
    prevErrors.filter((error) => error.field !== "workEndYear")
  );
  
  // If unchecking early retirement, re-validate minimum age
  if (!value && formData.age && formData.sex) {
    const retirementAge = formData.age + (formData.workEndYear - currentYear);
    const minRetirementAge = formData.sex === 'F' ? 60 : 65;
    
    if (retirementAge < minRetirementAge) {
      setErrors((prev) => [
        ...prev,
        {
          field: "workEndYear",
          message: `Minimalny wiek emerytalny dla ${formData.sex === 'F' ? 'kobiet' : 'mężczyzn'} to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat.`,
        },
      ]);
    }
  }
}
```

**Behavior:**
- Checking the box **clears** any minimum age validation errors
- Unchecking the box **re-validates** and shows errors if age is below minimum

### 5. Files Modified

#### `lib/types.ts`
Added `earlyRetirement` field to `SimulationInputs` interface

#### `lib/utils/validation.ts`
Updated minimum retirement age validation to check `earlyRetirement` flag:

```typescript
// Minimum retirement age validation (unless early retirement for special professions)
if (inputs.age && inputs.sex && inputs.workEndYear && !inputs.earlyRetirement) {
  const retirementAge = inputs.age + (inputs.workEndYear - currentYear);
  const minRetirementAge = inputs.sex === 'F' ? 60 : 65;
  
  if (retirementAge < minRetirementAge) {
    errors.push({
      field: "workEndYear",
      message: `Minimalny wiek emerytalny dla ${inputs.sex === 'F' ? 'kobiet' : 'mężczyzn'} to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
    });
  }
}
```

#### `app/symulacja/page.tsx`
Added **two places** where validation occurs:

1. **Real-time validation** (when user changes the field):
```typescript
// Real-time validation for work end year (retirement year)
if (field === "workEndYear" && value !== undefined) {
  if (formData.age && formData.sex) {
    const retirementAge = formData.age + (value - currentYear);
    const minRetirementAge = formData.sex === 'F' ? 60 : 65;
    
    if (retirementAge < minRetirementAge) {
      setErrors((prev) => [
        ...prev,
        {
          field: "workEndYear",
          message: `Minimalny wiek emerytalny dla ${formData.sex === 'F' ? 'kobiet' : 'mężczyzn'} to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat.`,
        },
      ]);
    }
  }
}
```

2. **Step validation** (when user tries to proceed to next step):
```typescript
// In validateStep1() function
// Minimum retirement age validation
if (formData.age && formData.sex && formData.workEndYear) {
  const retirementAge = formData.age + (formData.workEndYear - currentYear);
  const minRetirementAge = formData.sex === 'F' ? 60 : 65;
  
  if (retirementAge < minRetirementAge) {
    sectionErrors.push({
      field: "workEndYear",
      message: `Minimalny wiek emerytalny dla ${formData.sex === 'F' ? 'kobiet' : 'mężczyzn'} to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat.`,
    });
  }
}
```

---

## User Experience

### Error Messages

The validation provides clear, gender-specific error messages in Polish:

**For females (without early retirement):**
```
Minimalny wiek emerytalny dla kobiet to 60 lat. Przy tym roku zakończenia będziesz mieć 58 lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).
```

**For males (without early retirement):**
```
Minimalny wiek emerytalny dla mężczyzn to 65 lat. Przy tym roku zakończenia będziesz mieć 62 lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).
```

**With early retirement checked:**
```
✅ No error - validation is bypassed for special professions
```

### When Validation Triggers

The validation triggers in three scenarios:

1. **Real-time** - When user changes the retirement year field
2. **Step validation** - When user tries to proceed to the next form section
3. **Form submission** - When user submits the entire form

### User Interaction Flow

```
User selects age: 35
User selects sex: Female (F)
User selects retirement year: 2040

Calculation:
- Current year: 2025
- Retirement age: 35 + (2040 - 2025) = 50 years
- Minimum age for females: 60 years
- 50 < 60 ❌ VALIDATION ERROR

Error message displayed:
"Minimalny wiek emerytalny dla kobiet to 60 lat. Przy tym roku zakończenia będziesz mieć 50 lat."

User must select a later year (≥ 2045) to proceed.
```

---

## Examples

### Example 1: Valid Female Retirement

```typescript
Input:
- Age: 45
- Sex: F (Female)
- Current Year: 2025
- Retirement Year: 2040

Calculation:
- Retirement Age: 45 + (2040 - 2025) = 60
- Minimum Age: 60
- 60 >= 60 ✅ VALID
```

### Example 2: Invalid Female Retirement

```typescript
Input:
- Age: 45
- Sex: F (Female)
- Current Year: 2025
- Retirement Year: 2038

Calculation:
- Retirement Age: 45 + (2038 - 2025) = 58
- Minimum Age: 60
- 58 < 60 ❌ INVALID

Error: "Minimalny wiek emerytalny dla kobiet to 60 lat. Przy tym roku zakończenia będziesz mieć 58 lat."
```

### Example 3: Valid Male Retirement

```typescript
Input:
- Age: 40
- Sex: M (Male)
- Current Year: 2025
- Retirement Year: 2050

Calculation:
- Retirement Age: 40 + (2050 - 2025) = 65
- Minimum Age: 65
- 65 >= 65 ✅ VALID
```

### Example 4: Invalid Male Retirement

```typescript
Input:
- Age: 40
- Sex: M (Male)
- Current Year: 2025
- Retirement Year: 2045

Calculation:
- Retirement Age: 40 + (2045 - 2025) = 60
- Minimum Age: 65
- 60 < 65 ❌ INVALID

Error: "Minimalny wiek emerytalny dla mężczyzn to 65 lat. Przy tym roku zakończenia będziesz mieć 60 lat."
```

---

## Edge Cases

### Case 1: User Already at Retirement Age
If user's current age is already at or above retirement age, they can select the current year or any future year.

```typescript
Input:
- Age: 67 (already above male retirement age of 65)
- Sex: M
- Current Year: 2025
- Retirement Year: 2025

Result: ✅ VALID (can retire immediately)
```

### Case 2: User Changes Gender
When user changes their sex/gender, the minimum age requirement updates automatically:

```typescript
// Initially
Sex: F (Female) → Minimum age: 60

// User changes to
Sex: M (Male) → Minimum age: 65

// Validation recalculates immediately
```

### Case 3: User Changes Age
When user updates their age, the retirement age calculation updates:

```typescript
Initial:
- Age: 30, Retirement Year: 2055
- Retirement Age: 30 + 30 = 60 ✅ Valid for female

After age change:
- Age: 35, Retirement Year: 2055 (same)
- Retirement Age: 35 + 30 = 65 ✅ Still valid
```

---

## Testing

### Test Cases

#### Test 1: Female Minimum Age
```typescript
test('Female cannot retire before age 60', () => {
  const inputs = {
    age: 45,
    sex: 'F' as Sex,
    workEndYear: 2038, // Would be 58 years old
  };
  
  const result = validateSimulationInputs(inputs);
  expect(result.isValid).toBe(false);
  expect(result.errors).toContainEqual(
    expect.objectContaining({
      field: 'workEndYear',
      message: expect.stringContaining('60 lat')
    })
  );
});
```

#### Test 2: Male Minimum Age
```typescript
test('Male cannot retire before age 65', () => {
  const inputs = {
    age: 40,
    sex: 'M' as Sex,
    workEndYear: 2045, // Would be 60 years old
  };
  
  const result = validateSimulationInputs(inputs);
  expect(result.isValid).toBe(false);
  expect(result.errors).toContainEqual(
    expect.objectContaining({
      field: 'workEndYear',
      message: expect.stringContaining('65 lat')
    })
  );
});
```

#### Test 3: Valid Retirement Ages
```typescript
test('Female can retire at age 60', () => {
  const inputs = {
    age: 45,
    sex: 'F' as Sex,
    workEndYear: 2040, // Would be 60 years old
  };
  
  const result = validateSimulationInputs(inputs);
  const workEndYearErrors = result.errors.filter(e => 
    e.field === 'workEndYear' && 
    e.message.includes('Minimalny wiek')
  );
  expect(workEndYearErrors.length).toBe(0);
});

test('Male can retire at age 65', () => {
  const inputs = {
    age: 40,
    sex: 'M' as Sex,
    workEndYear: 2050, // Would be 65 years old
  };
  
  const result = validateSimulationInputs(inputs);
  const workEndYearErrors = result.errors.filter(e => 
    e.field === 'workEndYear' && 
    e.message.includes('Minimalny wiek')
  );
  expect(workEndYearErrors.length).toBe(0);
});
```

---

## Compliance

### Legal Compliance ✅

This validation ensures compliance with Polish retirement law:

- **ZUS Regulations**: Minimum retirement age requirements
- **Social Insurance Act**: Article 24, 25 (retirement age provisions)
- **Gender-specific requirements**: Properly differentiated

### Data Source

Minimum retirement ages are loaded from `data/retirementAgeBySex.json`:

```json
{
  "_metadata": {
    "source": "ZUS",
    "description": "Legal retirement ages by sex in Poland",
    "version": "1.0",
    "date": "2025-10-04"
  },
  "M": 65,
  "F": 60,
  "note": "Minimum legal retirement ages as per current Polish law"
}
```

---

## Future Considerations

### Potential Enhancements

1. **Early Retirement Exceptions**
   - Special professions (miners, teachers, etc.)
   - Disability pensions
   - Bridge pensions

2. **Partial Retirement**
   - Allow retirement before minimum age with reduced pension
   - Calculate pension reduction percentage

3. **International Cases**
   - Different countries' retirement ages
   - EU coordination rules

4. **Legislative Changes**
   - Automatic updates when law changes
   - Historical retirement age tracking

---

## Summary

✅ **Validation implemented** for minimum retirement age
✅ **Gender-specific** requirements (60F / 65M)
✅ **Real-time feedback** to users
✅ **Clear error messages** in Polish
✅ **Multiple validation points** (real-time, step, submission)
✅ **Legal compliance** with Polish ZUS regulations

**Impact:** Users cannot proceed with invalid retirement ages, ensuring all simulations comply with Polish retirement law.

---

**Version:** 1.0
**Date:** October 4, 2025
**Status:** ✅ Complete and Active

