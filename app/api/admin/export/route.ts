import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
    try {
        const sql = getDb();

        // Fetch all simulation data
        const data = await sql`
      SELECT 
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
      FROM raport_zainteresowania
      ORDER BY data_uzycia DESC, godzina_uzycia DESC
    `;

        return NextResponse.json({
            success: true,
            data: data,
        });
    } catch (error) {
        console.error("Error exporting data:", error);
        return NextResponse.json(
            { success: false, error: "Failed to export data" },
            { status: 500 }
        );
    }
}
