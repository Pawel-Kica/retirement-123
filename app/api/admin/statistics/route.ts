import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const sql = getDb();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "30days"; // "24hours", "7days", "30days", "3months", "6months", "all"

        // Get the appropriate time filter
        const getTimeFilter = () => {
            switch (period) {
                case "24hours":
                    return sql`WHERE data_uzycia >= CURRENT_DATE - INTERVAL '1 day'`;
                case "7days":
                    return sql`WHERE data_uzycia >= CURRENT_DATE - INTERVAL '7 days'`;
                case "30days":
                    return sql`WHERE data_uzycia >= CURRENT_DATE - INTERVAL '30 days'`;
                case "3months":
                    return sql`WHERE data_uzycia >= CURRENT_DATE - INTERVAL '3 months'`;
                case "6months":
                    return sql`WHERE data_uzycia >= CURRENT_DATE - INTERVAL '6 months'`;
                case "all":
                default:
                    return sql``;
            }
        };

        // Daily simulations
        let dailySimulations;
        if (period === "24hours") {
            // Show hourly data for 24 hours
            dailySimulations = await sql`
        SELECT 
          EXTRACT(HOUR FROM godzina_uzycia) as hour,
          COUNT(*) as count
        FROM raport_zainteresowania
        ${getTimeFilter()}
        GROUP BY EXTRACT(HOUR FROM godzina_uzycia)
        ORDER BY hour
      `;
        } else {
            // Show daily data for other periods
            const limit = period === "7days" ? 7 : period === "30days" ? 30 : period === "3months" ? 90 : period === "6months" ? 180 : 365;
            dailySimulations = await sql`
        SELECT 
          data_uzycia::date as date,
          COUNT(*) as count
        FROM raport_zainteresowania
        ${getTimeFilter()}
        GROUP BY data_uzycia::date
        ORDER BY data_uzycia::date DESC
        LIMIT ${limit}
      `;
        }

        // Hourly usage pattern
        const hourlyUsage = await sql`
      SELECT 
        EXTRACT(HOUR FROM godzina_uzycia) as hour,
        COUNT(*) as count
      FROM raport_zainteresowania
      GROUP BY EXTRACT(HOUR FROM godzina_uzycia)
      ORDER BY hour
    `;

        // Gender breakdown
        const genderBreakdown = await sql`
      SELECT 
        plec as gender,
        COUNT(*) as count
      FROM raport_zainteresowania
      WHERE plec IS NOT NULL
      GROUP BY plec
    `;

        // Age distribution
        const ageDistribution = await sql`
      SELECT 
        CASE 
          WHEN wiek < 30 THEN '<30'
          WHEN wiek >= 30 AND wiek < 40 THEN '30-40'
          WHEN wiek >= 40 AND wiek < 50 THEN '40-50'
          WHEN wiek >= 50 AND wiek < 60 THEN '50-60'
          ELSE '60+'
        END as age_group,
        COUNT(*) as count
      FROM raport_zainteresowania
      WHERE wiek IS NOT NULL
      GROUP BY age_group
      ORDER BY age_group
    `;

        // Salary distribution
        const salaryDistribution = await sql`
      SELECT 
        FLOOR(wysokosc_wynagrodzenia / 1000) * 1000 as salary_bucket,
        COUNT(*) as count
      FROM raport_zainteresowania
      WHERE wysokosc_wynagrodzenia IS NOT NULL
      GROUP BY salary_bucket
      ORDER BY salary_bucket
    `;

        // Expected vs Actual pension
        const pensionComparison = await sql`
      SELECT 
        emerytura_oczekiwana as expected,
        emerytura_rzeczywista as actual,
        emerytura_urealniona as adjusted
      FROM raport_zainteresowania
      WHERE emerytura_oczekiwana IS NOT NULL 
        AND emerytura_rzeczywista IS NOT NULL
      LIMIT 500
    `;

        // Illness period inclusion
        const illnessInclusion = await sql`
      SELECT 
        uwzglednial_okresy_choroby as included_l4,
        COUNT(*) as count
      FROM raport_zainteresowania
      GROUP BY uwzglednial_okresy_choroby
    `;

        // Accumulated funds distribution
        const fundsDistribution = await sql`
      SELECT 
        FLOOR(wysokosc_srodkow / 10000) * 10000 as funds_bucket,
        COUNT(*) as count
      FROM raport_zainteresowania
      WHERE wysokosc_srodkow IS NOT NULL
      GROUP BY funds_bucket
      ORDER BY funds_bucket
    `;

        // Geographic distribution
        const postalCodeDistribution = await sql`
      SELECT 
        kod_pocztowy as postal_code,
        COUNT(*) as count
      FROM raport_zainteresowania
      WHERE kod_pocztowy IS NOT NULL
      GROUP BY kod_pocztowy
      ORDER BY count DESC
      LIMIT 50
    `;

        // Calculate retirement statistics
        const retirementStats = await sql`
      SELECT 
        AVG(wiek + (EXTRACT(YEAR FROM data_uzycia) - EXTRACT(YEAR FROM data_uzycia))) as avg_current_age,
        COUNT(CASE WHEN plec = 'M' AND wiek >= 65 THEN 1 END) as men_beyond_min_age,
        COUNT(CASE WHEN plec = 'F' AND wiek >= 60 THEN 1 END) as women_beyond_min_age,
        COUNT(CASE WHEN plec = 'M' THEN 1 END) as total_men,
        COUNT(CASE WHEN plec = 'F' THEN 1 END) as total_women,
        COUNT(CASE WHEN wysokosc_srodkow IS NOT NULL AND wysokosc_srodkow > 0 THEN 1 END) as with_capital,
        COUNT(CASE WHEN wysokosc_srodkow IS NULL OR wysokosc_srodkow = 0 THEN 1 END) as without_capital,
        COUNT(CASE WHEN kod_pocztowy IS NOT NULL AND kod_pocztowy != '' THEN 1 END) as with_postal_code,
        COUNT(CASE WHEN kod_pocztowy IS NULL OR kod_pocztowy = '' THEN 1 END) as without_postal_code
      FROM raport_zainteresowania
      ${getTimeFilter()}
    `;

        const overallStats = await sql`
      SELECT 
        COUNT(*) as total_simulations,
        AVG(wiek) as avg_age,
        AVG(wysokosc_wynagrodzenia) as avg_salary,
        AVG(emerytura_rzeczywista) as avg_pension_nominal,
        AVG(emerytura_urealniona) as avg_pension_real,
        MIN(data_uzycia) as first_simulation,
        MAX(data_uzycia) as last_simulation
      FROM raport_zainteresowania
      ${getTimeFilter()}
    `;

        return NextResponse.json({
            success: true,
            data: {
                dailySimulations,
                hourlyUsage,
                genderBreakdown,
                ageDistribution,
                salaryDistribution,
                pensionComparison,
                illnessInclusion,
                fundsDistribution,
                postalCodeDistribution,
                overallStats: overallStats[0],
                retirementStats: retirementStats[0],
                period,
            },
        });
    } catch (error) {
        console.error("Error fetching admin statistics:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch statistics",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

