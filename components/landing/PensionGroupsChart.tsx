/**
 * PensionGroupsChart Component - Distribution of pension groups with hover info
 */

'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/shared/Card';

const pensionGroups = [
  {
    name: 'Poniżej minimalnej',
    value: 15,
    color: 'rgb(240,94,94)', // Red
    description: 'Emeryci z krótkim stażem pracy, niekwalifikujący się do gwarancji emerytury minimalnej',
    detail: 'Niska aktywność zawodowa, brak wymaganego stażu 25/20 lat',
  },
  {
    name: 'Około minimalnej',
    value: 25,
    color: 'rgb(190,195,206)', // Gray
    description: 'Minimalny staż pracy, regularne składki - emerytura zbliżona do minimalnej',
    detail: 'Staż ~20-25 lat, składki z przeciętnych zarobków',
  },
  {
    name: 'Około średniej',
    value: 35,
    color: 'rgb(63,132,210)', // Blue
    description: 'Przeciętna kariera → emerytura na poziomie średniej krajowej (~3 500 zł)',
    detail: 'Stabilna kariera zawodowa przez 30-40 lat',
  },
  {
    name: 'Powyżej średniej',
    value: 20,
    color: 'rgb(0,153,63)', // Green
    description: 'Wyższe zarobki, długi staż pracy - emerytura powyżej średniej krajowej',
    detail: 'Wysokie składki przez większość kariery',
  },
  {
    name: 'Znacznie powyżej',
    value: 5,
    color: 'rgb(255,179,79)', // Amber
    description: 'Bardzo wysokie zarobki przez całą karierę zawodową - maksymalny staż',
    detail: 'Kadra zarządzająca, specjaliści z długim stażem',
  },
];

export function PensionGroupsChart() {
  // Default to middle group (Około średniej - index 2)
  const [activeIndex, setActiveIndex] = useState<number>(2);

  const handleBarClick = (data: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="w-full">
      <h2 className="text-2xl font-bold text-zus-navy mb-6">
        Rozkład grup emerytalnych w Polsce
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={pensionGroups}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-15}
            textAnchor="end"
            height={100}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            label={{ value: '% emerytów', angle: -90, position: 'insideLeft' }}
          />
          <Bar
            dataKey="value"
            onClick={handleBarClick}
            cursor="pointer"
          >
            {pensionGroups.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={activeIndex === index ? 1 : 0.6}
                className="transition-opacity duration-200"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Always visible description below chart */}
      <div
        className="mt-6 p-5 bg-white rounded-lg border-l-4 shadow-sm transition-all duration-300"
        style={{ borderLeftColor: pensionGroups[activeIndex].color }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: pensionGroups[activeIndex].color }}
          />
          <div className="flex-1">
            <p className="font-bold text-zus-navy text-lg mb-2">{pensionGroups[activeIndex].name}</p>
            <p className="text-gray-700 mb-2">{pensionGroups[activeIndex].description}</p>
            <p className="text-sm text-gray-500 italic">{pensionGroups[activeIndex].detail}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Udział:</span> ~{pensionGroups[activeIndex].value}% emerytów w Polsce
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-4 text-sm text-center text-gray-600 italic">
        💡 Przeciętna kariera → około 3 500 zł emerytury
      </p>
    </Card>
  );
}
