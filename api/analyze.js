export default async function handler(req, res) {

  // CORS
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

    // validasi input
    if (!activities || activities.trim() === "") {
      return res.status(400).json({
        error: "Data aktivitas kosong"
      });
    }

    // cek Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY belum diset di Vercel"
      });
    }

    // prompt AI
    const prompt = `
Berikut adalah daftar aktivitas harian mahasiswa:

${activities}

Tolong:
1. Simpulkan pola aktivitas mahasiswa
2. Beri penilaian:
   - rajin
   - seimbang
   - kurang produktif
   - perlu evaluasi
3. Jelaskan alasannya secara singkat
4. Berikan 2 saran perbaikan

Gunakan bahasa Indonesia sederhana dan rapi.
`;

    // request ke Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
          ]
        })
      }
    );

    // ambil response
    const data = await response.json();

    console.log(data);

    // jika gagal
    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gagal mendapatkan respons dari Gemini AI"
      });
    }

    // ambil text hasil Gemini
    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // jika hasil kosong
    if (!result) {

      return res.status(500).json({
        error: "Respons Gemini kosong"
      });
    }

    // sukses
    return res.status(200).json({
      result: result
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message || "Terjadi kesalahan server"
    });
  }
}
