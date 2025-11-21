import { shuffleArray } from "./helper.js";

export let preferences = {
  jenjang: [],
  kelas: [],
  mapel: [
    { id: 9, uuid: "09c20bfc-cfc0-42e1-8abe-6b5a5ad0d6cd", kode: "BID", nama: "Bahasa Indonesia" },
    { id: 3, uuid: "6fd3994b-add1-49af-b438-e51fddea7c09", kode: "BIO", nama: "Biologi" },
    { id: 1, uuid: "d4a35037-7100-4642-b997-fb0008dc8051", kode: "MAT", nama: "Matematika" },
    { id: 2, uuid: "3e2f3f6e-1f5e-4d3c- ninety-nine 8a5c-5c3f3e2f1f4e", kode: "FIS", nama: "Fisika" },
    { id: 4, uuid: "44661743-c72a-4928-a686-5c73e4713be1", kode: "KIM", nama: "Kimia" },
    { id: 5, uuid: "8adfb8fb-9567-4cfe-926c-f9b6a6b7e412", kode: "EKO", nama: "Ekonomi" },
    { id: 21, uuid: "f103bbe8-1a8e-49d8-85e6-550defe41736", kode: "IPS", nama: "Ilmu Pengetahuan Sosial" },
  ],
  // mapel: [],
};

export function savePreferences(data) {
  preferences.jenjang = data.tingkatan;
  preferences.kelas = data.kelas;
  // preferences.mapel = data.mapel;
}

export function generateOptions() {
  const jenjangSelect = $("#selectJenjang");
  const mapelSelect = $("#selectMapel");

  jenjangSelect.empty();
  mapelSelect.empty();

  jenjangSelect.append(`<option value=""> Pilih Jenjang</option>`);
  mapelSelect.append(`<option value=""> Pilih Mapel</option>`);

  preferences.jenjang.forEach((item) => {
    jenjangSelect.append(`<option value="${item.id}">${item.nama}</option>`);
  });

  preferences.mapel.forEach((item) => {
    mapelSelect.append(`<option value="${item.id}">${item.nama}</option>`);
  });
}

export function updateKelasOptions(jenjangId) {
  const kelasSelect = $("#selectKelas");
  kelasSelect.empty();
  let kelasList = [];

  switch (parseInt(jenjangId)) {
    case 1: // SD
      $("#pKelas").show();
      kelasList = [1, 2, 3, 4, 5, 6];
      break;
    case 2: // SMP
      $("#pKelas").show();
      kelasList = [7, 8, 9];
      break;
    case 3: // SMA
      $("#pKelas").show();
      kelasList = [10, 11, 12];
      break;
    default:
      $("#pKelas").hide();
      kelasSelect.val("13");
      kelasList = [13];
  }

  $.each(kelasList, function (i, kls) {
    kelasSelect.append(`<option value="${kls}">Kelas ${kls}</option>`);
  });
}

export function setSoal(nomorSoal) {
  const soalData = JSON.parse(sessionStorage.getItem("questions"));
  if (!soalData || soalData.length === 0) {
    console.error("No questions available.");
    return;
  }

  const soal = soalData.data[nomorSoal - 1];

  if (!soal) {
    console.error("Question not found for nomorSoal:", nomorSoal);
    return;
  }
  $("#s-number").text(nomorSoal);
  $("#s-total").text(soalData.data.length);

  const soalContent = $("#soal")[0];
  soalContent.innerHTML = soal.question;
  renderMathInElement(soalContent, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true },
    ],
    throwOnError: false,
    strict: false,
  });
  // $("#soal").text(soal.question);

  if (soal.category === "pilihan_ganda") {
    $("#pilihan_ganda").show();
    $("#jawaban_pendek").hide();
    $("#pilihan_ganda").empty();
    const choiceKeys = Object.keys(soal.options);

    const shuffledChoices = shuffleArray(choiceKeys);
    shuffledChoices.forEach((choiceKey, index) => {
      // label tampilan: A, B, C, D (berdasarkan urutan baru)
      const label = String.fromCharCode(65 + index); // 65 = 'A'

      $("#pilihan_ganda").append(`
        <div class="w-full md:w-1/2 p-2">
          <button
            data-jawaban="${choiceKey}" 
            class="max-h-32 h-full md:h-20 w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-left items-start hover:bg-blue-50 hover:cursor-pointer"
          >
            ${label}. ${soal.options[choiceKey]}
          </button>
        </div>
      `);
    });
  } else if (soal.category === "jawaban_pendek") {
    $("#pilihan_ganda").hide();
    $("#jawaban_pendek").show();
    $("#jawaban").val("");
  }
}

export function getInitials(user) {
  const camelUser = [];
  const words = user.split(" ");

  words.forEach((word, index) => {
    camelUser[index] = word.charAt(0).toUpperCase();
  });
  
  // return camelUser.join("");
  $("#initial").text(camelUser.join(""));
}

// function getIni
