/**
 * https://www.zus.pl/swiadczenia/kapital-poczatkowy/czym-jest-kapital-poczatkowy-i-komu-go-ustalamy
 * https://www.zus.pl/swiadczenia/emerytury/emerytura-dla-osob-urodzonych-po-31-grudnia-1948/sposob-wyliczenia-emerytury
 *
 * P - podstawa obliczenia emerytury
 * T - średnie dalsze trwanie życia osoby w miesiącach,
 * K_p - kapitał początkowy
 * S — suma zwaloryzowanych składek
 * S_sub - suma z OFE
 *
 * W - wynagrodzenie brutto
 * s = 19,52% // Wysokość składki w %
 *
 * E = P / T
 * P = K_p + S + S_sub
 *
 */

import { readFileSync } from "fs";

function parseLifeDurationCsv() {
  const lines = readFileSync("data/life-duration.csv", "utf8").split("\n");
  const data: number[][] = [];

  // Skip header rows
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(";");
    const yearData: number[] = [];

    // First value is the year
    const year = parseInt(values[0]);
    if (isNaN(year)) continue;

    // Remaining values are months (skip first empty column)
    for (let j = 1; j < values.length; j++) {
      const monthValue = parseFloat(values[j].replace(",", "."));
      if (!isNaN(monthValue)) {
        yearData.push(monthValue);
      }
    }

    if (yearData.length === 12) {
      data[year] = yearData;
    }
  }

  return data;
}

const lifeDuration = parseLifeDurationCsv();
const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;
const MONTH_IN_MS = YEAR_IN_MS / 12;
const YEARLY_VALORIZATION = 0.075;

export interface PensionsStartParams {
  years: number;
  months: number;
}

function averageRemainingLife({
  years: year,
  months: month,
}: PensionsStartParams) {
  if (!lifeDuration[year]) {
    throw new Error(`Life duration not found for age ${year}`);
  }
  if (!lifeDuration[year][month]) {
    throw new Error(
      `Life duration not found for age ${year} and month ${month}`
    );
  }
  return lifeDuration[year][month];
}

const PENSION_CONTRIBUTION = 0.1952;
const OFE_CONTRIBUTION = 0.073;
const INFLATION_RATE = 0.0236487828;

import round from "lodash.round";

function calculatePension(args: {
  dateOfBirth: Date;
  sex: "M" | "F";
  wageBrutto: number;
  workStartDate: Date;
  pensionStart: PensionsStartParams;
  initialCapital: number;
}) {
  const remainingMonths = Math.ceil(averageRemainingLife(args.pensionStart));
  console.log("remainingMonths :>> ", remainingMonths);
  const start_date_ts =
    args.dateOfBirth.getTime() +
    args.pensionStart.years * YEAR_IN_MS +
    args.pensionStart.months * MONTH_IN_MS;
  console.log(
    "RETIREMENT_START_DATE :>> ",
    new Date(start_date_ts).toDateString()
  );

  let s = args.initialCapital;
  for (let i = 0; i < Math.floor(remainingMonths / 12); i++) {
    s *= 1 + YEARLY_VALORIZATION;
    s += args.wageBrutto * PENSION_CONTRIBUTION * 12;
    args.wageBrutto *= 1 + INFLATION_RATE;
  }
  const accountBalanceAtRetirement = s;
  console.log("accountBalanceAtRetirement :>> ", accountBalanceAtRetirement);
  const pension = accountBalanceAtRetirement / remainingMonths;
  return round(pension * Math.pow(1 + INFLATION_RATE / 12, remainingMonths), 2);
}

console.log(
  calculatePension({
    dateOfBirth: new Date("1970-01-01"),
    sex: "M",
    wageBrutto: 9000,
    workStartDate: new Date("1990-01-01"),
    pensionStart: {
      years: 70,
      months: 1,
    },
    initialCapital: 100000,
  })
);

// estymacje: inflacja, pensja, wzrost pensji, waloryzacja

// 4 866,32 zł
// 4 866.32

// 4866.32 = 3420.97 * (1 + X / 12) ^ 179
// (1 + X / 12) ^ 179 = 4866.32 / 3420.97
// 1 + X / 12 = (4866.32 / 3420.97) ^ (1 / 179)
// X / 12 = (4866.32 / 3420.97) ^ (1 / 179) - 1
// X = 12 * ((4866.32 / 3420.97) ^ (1 / 179) - 1)
// X = 0.019999999999999996
// X = 0.02
// 0,0236487828
