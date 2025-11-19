import React, { useRef, useState } from 'react';

const mockReports = [
  { id: 1, name: 'Blood Test Report.pdf', date: '2025-09-10' },
  { id: 2, name: 'X-Ray Result.jpg', date: '2025-08-28' },
];

const Reports = () => {
  const [reports, setReports] = useState(mockReports);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef();

  const handleUpload = (e) => {
    e.preventDefault();
    const file = fileInput.current.files[0];
    if (!file) return;
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setReports([
        { id: Date.now(), name: file.name, date: new Date().toISOString().slice(0, 10) },
        ...reports,
      ]);
      setUploading(false);
      fileInput.current.value = '';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Reports</h1>
      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow mb-8 w-full max-w-md">
        <input type="file" ref={fileInput} className="block w-full text-sm text-gray-700" />
        <button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload Report'}
        </button>
      </form>
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Previous Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id} className="py-2 flex justify-between items-center">
                <span className="text-blue-700 font-medium">{report.name}</span>
                <span className="text-gray-500 text-sm">{report.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reports;
