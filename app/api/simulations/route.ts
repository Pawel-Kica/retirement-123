import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SIMULATIONS_FILE = path.join(process.cwd(), 'data', 'simulations.json');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Load existing simulations
        let simulations = [];
        try {
            const data = await fs.readFile(SIMULATIONS_FILE, 'utf-8');
            simulations = JSON.parse(data);
        } catch (e) {
            // File doesn't exist yet, start with empty array
        }

        // Add new simulation
        simulations.push({
            timestamp: body.timestamp || new Date().toISOString(),
            expectedPension: body.expectedPension,
            age: body.age,
            sex: body.sex,
            monthlyGross: body.monthlyGross,
            includeL4: body.includeL4,
            accountBalance: body.accountBalance || null,
            subAccountBalance: body.subAccountBalance || null,
            nominalPension: body.nominalPension,
            realPension: body.realPension,
            postalCode: body.postalCode || null,
        });

        // Save
        await fs.writeFile(
            SIMULATIONS_FILE,
            JSON.stringify(simulations, null, 2),
            'utf-8'
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging simulation:', error);
        return NextResponse.json(
            { error: 'Błąd podczas zapisywania danych' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const data = await fs.readFile(SIMULATIONS_FILE, 'utf-8');
        const simulations = JSON.parse(data);
        return NextResponse.json(simulations);
    } catch (error) {
        return NextResponse.json([]);
    }
}

