import { PDFDocument, rgb } from 'pdf-lib';

// Map blog post ID -> public PDF path
const METHODOLOGY_PDFS = {
  'bm-t001-additionality-indian-carbon-market': '/pdfs/BM-T-001 Methodology tool.pdf',
  'bm-en01001-renewable-energy-carbon-credits': '/pdfs/BM EN01.001.pdf',
};

// Generate a filename from the blog title (2-3 words)
const getFilename = (post) => {
  const words = post.title.split(' ').slice(0, 3).map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean);
  return `Sylithe_${words.join('_')}.pdf`;
};

export const downloadBlogPdf = async (post) => {
  const pdfPath = METHODOLOGY_PDFS[post.id];
  if (!pdfPath) {
    console.error('No PDF mapped for post:', post.id);
    return;
  }

  try {
    // 1. Fetch the existing PDF
    const existingPdfBytes = await fetch(pdfPath).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
      return res.arrayBuffer();
    });

    // 3. Load into pdf-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 4. Save and trigger download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename(post);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to download PDF. Please try again.');
  }
};
