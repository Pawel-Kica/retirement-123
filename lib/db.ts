import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
    if (!sql) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        sql = postgres(connectionString, {
            ssl: 'require',
            max: 10,
            idle_timeout: 20,
            connect_timeout: 10,
        });
    }

    return sql;
}

export interface SimulationData {
    emerytura_oczekiwana: number;
    wiek: number;
    plec: string;
    wysokosc_wynagrodzenia: number;
    uwzglednial_okresy_choroby: boolean;
    wysokosc_srodkow?: number;
    emerytura_rzeczywista: number;
    emerytura_urealniona: number;
    kod_pocztowy?: string;
}

export async function saveSimulation(data: SimulationData) {
    const sql = getDb();

    const now = new Date();
    const data_uzycia = now.toISOString().split('T')[0];
    const godzina_uzycia = now.toTimeString().split(' ')[0];

    try {
        const result = await sql`
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
        ${data_uzycia},
        ${godzina_uzycia},
        ${data.emerytura_oczekiwana},
        ${data.wiek},
        ${data.plec},
        ${data.wysokosc_wynagrodzenia},
        ${data.uwzglednial_okresy_choroby},
        ${data.wysokosc_srodkow ?? null},
        ${data.emerytura_rzeczywista},
        ${data.emerytura_urealniona},
        ${data.kod_pocztowy ?? null}
      )
      RETURNING id, data_uzycia, godzina_uzycia
    `;

        return {
            success: true,
            data: result[0],
        };
    } catch (error) {
        console.error('Error saving simulation to database:', error);
        throw error;
    }
}

