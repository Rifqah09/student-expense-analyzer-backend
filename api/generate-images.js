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

    const { expenses } = req.body;

    // validasi input
    if (!expenses || expenses.trim() === "") {
      return res.status(400).json({
        error: "Data pengeluaran kosong"
      });
    }

    // prompt gambar
    const prompt = `
Buat ilustrasi karakter mahasiswa berdasarkan hasil analisis pengeluaran berikut:

${expenses}

Karakter harus menyesuaikan kondisi mahasiswa dari hasil analisis AI.

Ketentuan:
- style anime chibi
- cute
- modern
- ekspresi wajah sesuai kondisi finansial
- pakaian dan aksesoris menyesuaikan gaya hidup
- background sederhana
- warna cerah
- detail dan high quality
- tanpa teks

Jika mahasiswa hemat:
- tampil rapi
- ceria
- sederhana
- membawa uang/tabungan

Jika mahasiswa boros:
- tampil panik
- banyak kantong belanja
- uang berkurang
- ekspresi lucu

Jika mahasiswa seimbang:
- tampil santai
- produktif
- stylish mahasiswa aktif

Gunakan gaya ilustrasi anime modern.
`;

    // generate URL gambar AI
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    console.log(imageUrl);

    // sukses
    return res.status(200).json({
      image: imageUrl
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message || "Gagal membuat gambar AI"
    });
  }
}
