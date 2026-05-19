export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Gunakan method POST"
    });
  }

  const { expenses } = req.body;

  if (!expenses) {
    return res.status(400).json({
      error: "Data pengeluaran kosong"
    });
  }

  try {

    const prompt = `
Berikut data pengeluaran mahasiswa:

${expenses}

Buat karakter mahasiswa lucu.

Style:
- chibi
- cute
- modern
- warna cerah
- tanpa teks
`;

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt,
          size: "1024x1024"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Gagal membuat gambar"
      });
    }

    return res.status(200).json({
      image: data.data[0].b64_json
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });
  }
}
