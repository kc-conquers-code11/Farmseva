'use client';

import React from 'react';

export type TableColumn = { key: string; header: string };

type TableProps<T extends { [key: string]: unknown }> = {
  columns: TableColumn[];
  rows: T[];
  rowKey: (row: T) => string;
};

export default function Table<T extends { [key: string]: unknown }>({ columns, rows, rowKey }: TableProps<T>) {
  return (
    <div className="overflow-x-auto border border-neutral-100 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-green-50 text-neutral-700">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-3 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-neutral-100 hover:bg-green-50/30">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-neutral-700">{String(row[c.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
