/**
 * Universal CSV Export Utility
 * Massivdagi ob'ektlarni CSV formatiga o'tkazib, brauzerda yuklab beradi.
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; label: string }>
): void {
  if (!data || data.length === 0) {
    return;
  }

  const headers = columns
    ? columns.map((col) => `"${col.label.replace(/"/g, '""')}"`)
    : Object.keys(data[0]).map((key) => `"${key.replace(/"/g, '""')}"`);

  const rows = data.map((item) => {
    if (columns) {
      return columns
        .map((col) => {
          const val = item[col.key];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    }

    return Object.values(item)
      .map((val) => {
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
