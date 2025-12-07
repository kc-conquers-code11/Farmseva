export async function GET() {
  try {
    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1GYaSR_EL4c-oKNyiTyx1XOv2aI-ON8WmGJ0G491j35E/export?format=csv";

    const response = await fetch(sheetUrl);

    if (!response.ok) {
      return new Response("Failed to fetch Google Sheet", { status: 500 });
    }

    const csvData = await response.text();

    return new Response(csvData, {
      headers: { "Content-Type": "text/csv" },
      status: 200,
    });

  } catch (error) {
    console.error("Outbreak API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
