
export const exportService = {
  /**
   * Triggers the browser print dialog.
   * Combined with the @media print CSS in index.html, this creates a clean PDF.
   */
  downloadAsPdf: (title: string = 'KI-Status-Bericht') => {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    document.title = originalTitle;
  },

  /**
   * Exports an array of objects to a CSV file.
   */
  exportToCSV: (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
