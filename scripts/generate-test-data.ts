import postgres from "postgres";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(databaseUrl, {
    ssl: {
        rejectUnauthorized: false,
    },
    max: 10,
});

// Helper function to generate random data
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function getRandomDate(daysBack: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - getRandomInt(0, daysBack));
    return date;
}

function getTodayDate(): Date {
    return new Date();
}

function getRandomTime(): string {
    const hours = getRandomInt(8, 20).toString().padStart(2, '0');
    const minutes = getRandomInt(0, 59).toString().padStart(2, '0');
    const seconds = getRandomInt(0, 59).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function getSpecificTime(hour: number): string {
    const minutes = getRandomInt(0, 59).toString().padStart(2, '0');
    const seconds = getRandomInt(0, 59).toString().padStart(2, '0');
    return `${hour.toString().padStart(2, '0')}:${minutes}:${seconds}`;
}

function getRandomPostalCode(): string | null {
    const shouldHavePostal = Math.random() > 0.3; // 70% chance of having postal code
    if (!shouldHavePostal) return null;

    const postalCodes = [
        '00-001', '01-234', '02-456', '03-789', '10-123',
        '20-456', '30-789', '40-123', '50-456', '60-789',
        '70-123', '80-456', '90-789', '31-234', '41-567'
    ];
    return postalCodes[getRandomInt(0, postalCodes.length - 1)];
}

async function generateTestData() {
    try {
        console.log("🚀 Generating test simulation data spread across LAST 6 MONTHS...\n");

        const numberOfSimulations = getRandomInt(15, 25);
        console.log(`📊 Creating ${numberOfSimulations} simulations...\n`);

        for (let i = 0; i < numberOfSimulations; i++) {
            // 50% chance of being beyond retirement age
            const isBeyondRetirement = Math.random() > 0.5;
            const sex = Math.random() > 0.5 ? 'M' : 'F';
            const retirementAge = sex === 'M' ? 65 : 60;

            let age: number;
            if (isBeyondRetirement) {
                // Generate age beyond retirement age
                age = getRandomInt(retirementAge, retirementAge + 5);
            } else {
                // Generate age below retirement age
                age = getRandomInt(25, retirementAge - 1);
            }
            const salary = getRandomFloat(4000, 20000);
            const hasL4 = Math.random() > 0.5;
            const hasCapital = Math.random() > 0.4; // 60% chance of having capital
            const capital = hasCapital ? getRandomFloat(50000, 500000) : null;

            // Calculate pensions based on salary and age
            const expectedPension = salary * 0.6 * (1 + (age - 30) * 0.01);
            const actualPension = expectedPension * (hasL4 ? 0.95 : 1.0);
            const realPension = actualPension * 0.7; // Accounting for inflation

            // Use random date within last 6 months (180 days)
            const date = getRandomDate(180);
            const time = getRandomTime();
            const postalCode = getRandomPostalCode();

            await sql`
        INSERT INTO raport_zainteresowania (
          data_uzycia,
          godzina_uzycia,
          emerytura_oczekiwana,
          wiek,
          plec,
          wysokosc_wynagrodzenia,
          uwzglednial_okresy_choroby,
          wysokosc_srodkow,
          emerytura_rzeczywista,
          emerytura_urealniona,
          kod_pocztowy
        ) VALUES (
          ${date.toISOString().split('T')[0]},
          ${time},
          ${expectedPension.toFixed(2)},
          ${age},
          ${sex},
          ${salary.toFixed(2)},
          ${hasL4},
          ${capital ? capital.toFixed(2) : null},
          ${actualPension.toFixed(2)},
          ${realPension.toFixed(2)},
          ${postalCode}
        )
      `;

            console.log(`✅ Simulation ${i + 1}/${numberOfSimulations} created:`);
            console.log(`   - Age: ${age}, Sex: ${sex === 'M' ? 'Mężczyzna' : 'Kobieta'}`);
            console.log(`   - Salary: ${salary.toFixed(2)} zł`);
            console.log(`   - Expected Pension: ${expectedPension.toFixed(2)} zł`);
            console.log(`   - Has L4: ${hasL4 ? 'Tak' : 'Nie'}`);
            console.log(`   - Capital: ${capital ? capital.toFixed(2) + ' zł' : 'Brak'}`);
            console.log(`   - Postal Code: ${postalCode || 'Brak'}`);
            console.log(`   - Date: ${date.toLocaleDateString('pl-PL')} ${time}\n`);
        }

        console.log(`\n🎉 Successfully created ${numberOfSimulations} test simulations!`);

        // Show summary
        const stats = await sql`
      SELECT 
        COUNT(*) as total,
        AVG(wiek) as avg_age,
        AVG(wysokosc_wynagrodzenia) as avg_salary,
        COUNT(CASE WHEN plec = 'M' THEN 1 END) as men,
        COUNT(CASE WHEN plec = 'F' THEN 1 END) as women
      FROM raport_zainteresowania
    `;

        console.log("\n📈 Database Summary:");
        console.log(`   - Total simulations: ${stats[0].total}`);
        console.log(`   - Average age: ${Math.round(parseFloat(stats[0].avg_age))} lat`);
        console.log(`   - Average salary: ${(parseFloat(stats[0].avg_salary) / 1000).toFixed(1)}k zł`);
        console.log(`   - Men: ${stats[0].men}, Women: ${stats[0].women}`);

    } catch (error) {
        console.error("❌ Error generating test data:", error);
        throw error;
    } finally {
        await sql.end();
    }
}

generateTestData();
