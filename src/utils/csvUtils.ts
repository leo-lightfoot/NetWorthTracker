import Papa from 'papaparse';

// Define the transaction interface
export interface Transaction {
  id: string;
  date: string;
  type: 'asset' | 'liability' | 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
}

export const parseCSV = (csvString: string): Transaction[] => {
  if (!csvString.trim()) {
    return [];
  }
  
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true  // Automatically convert numbers
  });
  
  return results.data.map((record: any) => ({
    ...record,
    amount: Number(record.amount || 0),
    id: record.id || Date.now() + Math.random().toString(36).substr(2, 9)
  })) as Transaction[];
};

export const generateCSV = (transactions: Transaction[]): string => {
  return Papa.unparse(transactions);
};

// For manual backups to local file system
export const downloadCSV = (transactions: Transaction[]): void => {
  const csv = generateCSV(transactions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `networth-${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// For importing from local CSV file
export const importCSV = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as Transaction[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}; 