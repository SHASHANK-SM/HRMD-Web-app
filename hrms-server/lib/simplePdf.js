// Small dependency-free PDF writer for text-only payslips.
const escapePdf = (value) => String(value ?? "").replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");

export const createTextPdf = (lines) => {
  const commands = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"];
  for (const line of lines) commands.push(`(${escapePdf(line)}) Tj`, "T*");
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream,"utf8")} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf="%PDF-1.4\n"; const offsets=[0];
  objects.forEach((obj,i)=>{ offsets.push(Buffer.byteLength(pdf,"utf8")); pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`; });
  const xref=Buffer.byteLength(pdf,"utf8"); pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; for(let i=1;i<offsets.length;i++)pdf+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`; pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf,"utf8");
};
