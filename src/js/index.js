import { hostApi, token, hostAI, aiToken } from "./config.js";
import { hmacSha256 } from "./helper.js";
import { savePreferences, generateOptions, updateKelasOptions, setSoal, preferences, getInitials } from "./ui.js";

const timestamp = Date.now().toString();

let correctAnswers = {};

function checkAnswer(qId, answer) {
  const soalData = JSON.parse(sessionStorage.getItem("questions"));
  if (!soalData || soalData.length === 0) {
    console.error("No questions available.");
    return;
  }

  const soal = soalData.data[qId];

  if (soal.category === "pilihan_ganda") {
    if (soal.answer[0] === answer) {
      correctAnswers[qId] = true;
    } else {
      correctAnswers[qId] = false;
    }
  } else if (soal.category === "jawaban_pendek") {
    validateAnswer(qId, soal.question, answer);
  }
}

async function getReferences() {
  const payload = ["GET", "/api/v1/references", timestamp, ""].join("|");
  const signature = await hmacSha256(token, payload);

  try {
    const response = await fetch(hostApi + "/api/v1/references", {
      method: "GET",
      headers: {
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "X-Request-Id": "unique-request-id-12345",
      },
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const data = await response.json();
    savePreferences(data);
    generateOptions();
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

async function getQuestions(nama = "contoh nama", kelasId = 10, mapelId = 1, tingkatanId = 3, jumlahSoal = 40) {
  const rawBody = JSON.stringify({
    nama: nama,
    kelasId: kelasId,
    kategori: "pilihan_ganda",
    mapelId: mapelId,
    tingkatanId: tingkatanId,
    per_page: jumlahSoal,
    limit: jumlahSoal,
  });
  const payload = ["POST", "/api/v1/questions", timestamp, rawBody].join("|");
  const signature = await hmacSha256(token, payload);

  try {
    const response = await fetch(hostApi + "/api/v1/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "X-Request-Id": "unique-request-id-12345",
      },
      body: rawBody,
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const data = await response.json();
    sessionStorage.setItem("questions", JSON.stringify(data));
    setSoal(1);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

async function validateAnswer(qId, question, answer) {
  const rawBody = JSON.stringify({
    soal: question,
    jawaban: answer,
  });
  try {
    const response = await fetch(hostAI + "/ai/validation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": aiToken,
      },
      body: rawBody,
    });
    if (!response.ok) {
      console.error("HTTP error", response.status);
      correctAnswers[qId] = null;
      return;
    }

    // ⬇ Ambil raw response dulu
    const raw = await response.text();

    if (!raw) {
      console.error("Response kosong dari server");
      correctAnswers[qId] = null;
      return;
    }

    // ⬇ Coba parse JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("Response bukan JSON valid:", raw);
      correctAnswers[qId] = null;
      return;
    }

    correctAnswers[qId] = data.correct;
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

$(document).ready(function () {
  sessionStorage.clear();

  getReferences();
  $("#pKelas").hide();
  $("#informasi").hide();

  $("#selectJenjang").on("change", function () {
    updateKelasOptions($(this).val());
  });

  $("#btn-mulai").on("click", function () {
    const data = {};

    const nama = $("#inputNama").val();
    const kelasId = $("#selectKelas").val();
    const mapelId = $("#selectMapel").val();
    const jenjangId = $("#selectJenjang").val();

    const kelas = preferences.kelas.find((k) => k.id == kelasId);
    const mapel = preferences.mapel.find((m) => m.id == mapelId);
    const jenjang = preferences.jenjang.find((j) => j.id == jenjangId);
    
    if (mapel.nama.length > 16) {
      $("#mapel").text(mapel.kode.toUpperCase());
    } else {
      $("#mapel").text(mapel.nama);
    }

    $("#nama").text(nama);
    $("#kelas").text(kelas.urutan);
    $("#jenjang").text(jenjang.kode.toUpperCase());

    $("#pStart").hide();
    $("#form").hide();
    $("#pSoal").show();
    $("#informasi").show();

    data.nama = nama;
    data.kelas = kelas;
    data.mapel = mapel;
    data.jenjang = jenjang;

    sessionStorage.setItem("user", JSON.stringify(data));
    getQuestions(nama, parseInt(kelasId), parseInt(mapelId), parseInt(jenjangId), 10);
    getInitials(nama);
  });

  $("#pilihan_ganda").on("click", "button", function () {
    $("#pilihan_ganda button").removeClass("is-active");
    $(this).addClass("is-active");
    $("#next-btn").show();
  });

  $("#jawaban").on("input", function () {
    $("#next-btn").show();
  });

  $("#next-btn").on("click", function () {
    let currentSoal = parseInt($("#s-number").text());
    let lastSoal = parseInt($("#s-total").text());

    checkAnswer(currentSoal - 1, $(".is-active").data("jawaban") || $("#jawaban").val() || "");

    if (currentSoal == lastSoal) {
      
      const totalCorrect = Object.values(correctAnswers).filter((v) => v === true).length;

      const lulus = totalCorrect >= lastSoal / 2;

      if (lulus) {
        Swal.fire({
          title: "Selamat! 🎉",
          html: `
          Kamu menjawab dengan sangat baik!<br><br>
          <b>Benar: ${totalCorrect} dari ${lastSoal}</b>
          `,
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Lanjut!",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(true);
            sessionStorage.clear();
          }
        });
      } else {
        Swal.fire({
          title: "Yah... 😢",
          html: `
          Jawaban kamu masih perlu ditingkatkan.<br><br>
          <b>Benar: ${totalCorrect} dari ${lastSoal}</b>
          `,
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "Coba Lagi",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(true);
            sessionStorage.clear();
          }
        });
      }
    }

    currentSoal += 1;
    setSoal(currentSoal);

    $(this).hide();
  });
});
