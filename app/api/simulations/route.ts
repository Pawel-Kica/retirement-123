import { NextRequest, NextResponse } from "next/server";
import { saveSimulation, SimulationData } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const simulationData: SimulationData = {
      emerytura_oczekiwana: body.expectedPension,
      wiek: body.age,
      plec: body.sex,
      wysokosc_wynagrodzenia: body.monthlyGross,
      uwzglednial_okresy_choroby: body.includeZwolnienieZdrowotne || false,
      wysokosc_srodkow: body.accountBalance || body.subAccountBalance || null,
      emerytura_rzeczywista: body.nominalPension,
      emerytura_urealniona: body.realPension,
      kod_pocztowy: body.postalCode || null,
    };

    const result = await saveSimulation(simulationData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving simulation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save simulation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Use POST to save simulation data"
  });
}
