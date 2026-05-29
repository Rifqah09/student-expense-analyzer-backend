export default async function handler(req, res) {

  // =========================
  // CORS
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // hanya POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Gunakan method POST"
    });
  }

  try {

    const { activities } = req.body;

    // =========================
    // Validasi Input
    // =========================
    if (!activities || activities.trim() === "") {

      return res.status(400).json({
        error: "Data aktivitas kosong"
      });
    }

    // =========================
    // Cek API Key Gemini
    // =========================
    if (!process.env.GEMINI_API_KEY) {

      return res.status(500).json({
        error: "GEMINI_API_KEY belum diset di Vercel"
      });
    }

    // =========================
    // Prompt AI
    // =========================
    const prompt = `
Berikut adalah daftar aktivitas harian mahasiswa:

${activities}

Tolong:
1. Simpulkan pola aktivitas mahasiswa
2. Beri penilaian:
   - Rajin
   - Seimbang
   - Kurang Produktif
   - Perlu Evaluasi
3. Jelaskan alasannya secara singkat
4. Berikan 2 saran perbaikan

Gunakan bahasa Indonesia yang sederhana, rapi, dan mudah dipahami.
`;

    // =========================
    // Request ke Gemini AI
    // =========================
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500
          }
        })
      }
    );

    // =========================
    // Ambil Response
    // =========================
    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));

    // =========================
    // Jika API gagal
    // =========================
    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gagal mendapatkan respons dari Gemini AI"
      });
    }

    // =========================
    // Ambil hasil text
    // =========================
    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // =========================
    // Jika hasil kosong
    // =========================
    if (!result) {

      return res.status(500).json({
        error: "Respons Gemini kosong"
      });
    }

    // =========================
    // Sukses
    // =========================
    return res.status(200).json({
      result: result
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "Terjadi kesalahan server"
    });
  }
}
