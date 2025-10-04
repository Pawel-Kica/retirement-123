"use client";

import {
  EmploymentGapPeriod,
  EmploymentPeriod,
  LifeEvent,
  Month,
} from "@/lib/types";
import { useState } from "react";

interface TimelineSidePanelProps {
  onCreateEmployment?: (p: Omit<EmploymentPeriod, "id">) => void;
  onCreateGap?: (p: Omit<EmploymentGapPeriod, "id">) => void;
  onCreateSickPoint?: (e: Omit<LifeEvent, "id">) => void;
}

export function TimelineSidePanel({
  onCreateEmployment,
  onCreateGap,
  onCreateSickPoint,
}: TimelineSidePanelProps) {
  const [tab, setTab] = useState<"work" | "gaps" | "events">("work");

  return (
    <div className="w-full md:w-80 bg-white border border-zus-grey-300 rounded p-4 space-y-3">
      <div className="flex gap-2">
        <button
          className={`px-3 py-2 rounded ${
            tab === "work"
              ? "bg-zus-green text-white"
              : "border border-zus-grey-300 text-zus-grey-700"
          }`}
          onClick={() => setTab("work")}
        >
          Praca
        </button>
        <button
          className={`px-3 py-2 rounded ${
            tab === "gaps"
              ? "bg-zus-green text-white"
              : "border border-zus-grey-300 text-zus-grey-700"
          }`}
          onClick={() => setTab("gaps")}
        >
          Przerwy
        </button>
        <button
          className={`px-3 py-2 rounded ${
            tab === "events"
              ? "bg-zus-green text-white"
              : "border border-zus-grey-300 text-zus-grey-700"
          }`}
          onClick={() => setTab("events")}
        >
          Zdarzenia
        </button>
      </div>

      {tab === "work" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as any;
            onCreateEmployment?.({
              startYear: Number(form.sy.value),
              endYear: Number(form.ey.value),
              startMonth: Number(form.sm.value) as Month,
              endMonth: Number(form.em.value) as Month,
              contractType: form.ct.value,
              monthlyGross: Number(form.salary.value),
            });
          }}
        >
          <div className="text-zus-grey-700 text-sm">Okres pracy</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="sy"
              className="border border-zus-grey-300 rounded px-3 py-2"
              placeholder="Rok start"
              required
            />
            <input
              name="ey"
              className="border border-zus-grey-300 rounded px-3 py-2"
              placeholder="Rok koniec"
              required
            />
            <select
              name="sm"
              className="border border-zus-grey-300 rounded px-3 py-2"
            >
              <option value="1">01</option>
              <option value="2">02</option>
              <option value="3">03</option>
              <option value="4">04</option>
              <option value="5">05</option>
              <option value="6">06</option>
              <option value="7">07</option>
              <option value="8">08</option>
              <option value="9">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <select
              name="em"
              className="border border-zus-grey-300 rounded px-3 py-2"
            >
              <option value="1">01</option>
              <option value="2">02</option>
              <option value="3">03</option>
              <option value="4">04</option>
              <option value="5">05</option>
              <option value="6">06</option>
              <option value="7">07</option>
              <option value="8">08</option>
              <option value="9">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <select
            name="ct"
            className="border border-zus-grey-300 rounded px-3 py-2 w-full"
          >
            <option value="UOP">UoP</option>
            <option value="B2B">B2B</option>
            <option value="UOZ">UoZ</option>
          </select>
          <input
            name="salary"
            className="border border-zus-grey-300 rounded px-3 py-2 w-full"
            placeholder="Wynagrodzenie mies."
            required
          />
          <button className="w-full bg-zus-green text-white hover:bg-zus-green-dark rounded px-3 py-2">
            Dodaj
          </button>
        </form>
      )}

      {tab === "gaps" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget as any;
            onCreateGap?.({
              kind: f.kind.value,
              startYear: Number(f.sy.value),
              startMonth: Number(f.sm.value) as Month,
              endYear: Number(f.ey.value),
              endMonth: Number(f.em.value) as Month,
            });
          }}
        >
          <select
            name="kind"
            className="border border-zus-grey-300 rounded px-3 py-2 w-full"
          >
            <option value="MATERNITY_LEAVE">Urlop macierzyński</option>
            <option value="UNPAID_LEAVE">Urlop bezpłatny</option>
            <option value="UNEMPLOYMENT">Bezrobocie</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="sy"
              className="border border-zus-grey-300 rounded px-3 py-2"
              placeholder="Rok start"
              required
            />
            <input
              name="ey"
              className="border border-zus-grey-300 rounded px-3 py-2"
              placeholder="Rok koniec"
              required
            />
            <select
              name="sm"
              className="border border-zus-grey-300 rounded px-3 py-2"
            >
              <option value="1">01</option>
              <option value="2">02</option>
              <option value="3">03</option>
              <option value="4">04</option>
              <option value="5">05</option>
              <option value="6">06</option>
              <option value="7">07</option>
              <option value="8">08</option>
              <option value="9">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <select
              name="em"
              className="border border-zus-grey-300 rounded px-3 py-2"
            >
              <option value="1">01</option>
              <option value="2">02</option>
              <option value="3">03</option>
              <option value="4">04</option>
              <option value="5">05</option>
              <option value="6">06</option>
              <option value="7">07</option>
              <option value="8">08</option>
              <option value="9">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <button className="w-full bg-zus-green text-white hover:bg-zus-green-dark rounded px-3 py-2">
            Dodaj
          </button>
        </form>
      )}

      {tab === "events" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget as any;
            onCreateSickPoint?.({
              type: "SICK_LEAVE",
              year: Number(f.year.value),
              month: Number(f.month.value) as Month,
              days: Number(f.days.value),
            });
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            <input
              name="year"
              className="border border-zus-grey-300 rounded px-3 py-2"
              placeholder="Rok"
              required
            />
            <select
              name="month"
              className="border border-zus-grey-300 rounded px-3 py-2"
            >
              <option value="1">01</option>
              <option value="2">02</option>
              <option value="3">03</option>
              <option value="4">04</option>
              <option value="5">05</option>
              <option value="6">06</option>
              <option value="7">07</option>
              <option value="8">08</option>
              <option value="9">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <input
              name="days"
              className="border border-zus-grey-300 rounded px-3 py-2"
              placeholder="Dni L4"
              defaultValue={182}
            />
          </div>
          <button className="w-full bg-transparent border-2 border-zus-green text-zus-green hover:bg-zus-green-light rounded px-3 py-2">
            Dodaj L4
          </button>
        </form>
      )}
    </div>
  );
}

export default TimelineSidePanel;
