import ExcelJS from 'exceljs';

export const exportToExcel = async (res, sheetName, columns, data, filename = 'report.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  await workbook.xlsx.write(res);
  res.end();
};
