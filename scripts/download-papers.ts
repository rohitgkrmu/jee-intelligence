/**
 * JEE Paper Download Script
 * Downloads JEE Main papers from MathonGo and JEE Advanced from official source
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const EXAM_PAPERS_DIR = path.join(process.cwd(), "exam papers");

interface JEEMainPaper {
  type: "MAIN";
  year: number;
  session: string;
  date: string;
  shift: number;
  url: string;
}

interface JEEAdvancedPaper {
  type: "ADVANCED";
  year: number;
  paper: 1 | 2;
  url: string;
}

type PaperInfo = JEEMainPaper | JEEAdvancedPaper;

// JEE Advanced papers from official jeeadv.ac.in (2019-2025 available)
const advancedPapers: JEEAdvancedPaper[] = [
  // 2025
  { type: "ADVANCED", year: 2025, paper: 1, url: "https://jeeadv.ac.in/past_qps/2025_1_English.pdf" },
  { type: "ADVANCED", year: 2025, paper: 2, url: "https://jeeadv.ac.in/past_qps/2025_2_English.pdf" },
  // 2024
  { type: "ADVANCED", year: 2024, paper: 1, url: "https://jeeadv.ac.in/past_qps/2024_1_English.pdf" },
  { type: "ADVANCED", year: 2024, paper: 2, url: "https://jeeadv.ac.in/past_qps/2024_2_English.pdf" },
  // 2023
  { type: "ADVANCED", year: 2023, paper: 1, url: "https://jeeadv.ac.in/past_qps/2023_1_English.pdf" },
  { type: "ADVANCED", year: 2023, paper: 2, url: "https://jeeadv.ac.in/past_qps/2023_2_English.pdf" },
  // 2022
  { type: "ADVANCED", year: 2022, paper: 1, url: "https://jeeadv.ac.in/past_qps/2022_1_English.pdf" },
  { type: "ADVANCED", year: 2022, paper: 2, url: "https://jeeadv.ac.in/past_qps/2022_2_English.pdf" },
  // 2021
  { type: "ADVANCED", year: 2021, paper: 1, url: "https://jeeadv.ac.in/past_qps/2021_1_English.pdf" },
  { type: "ADVANCED", year: 2021, paper: 2, url: "https://jeeadv.ac.in/past_qps/2021_2_English.pdf" },
  // 2020
  { type: "ADVANCED", year: 2020, paper: 1, url: "https://jeeadv.ac.in/past_qps/2020_1_English.pdf" },
  { type: "ADVANCED", year: 2020, paper: 2, url: "https://jeeadv.ac.in/past_qps/2020_2_English.pdf" },
  // 2019
  { type: "ADVANCED", year: 2019, paper: 1, url: "https://jeeadv.ac.in/past_qps/2019_1_English.pdf" },
  { type: "ADVANCED", year: 2019, paper: 2, url: "https://jeeadv.ac.in/past_qps/2019_2_English.pdf" },
];

// JEE Main papers from MathonGo
const mainPapers: JEEMainPaper[] = [
  // 2024 January
  { type: "MAIN", year: 2024, session: "January", date: "27_Jan", shift: 1, url: "https://links.mathongo.com/Qe0X" },
  { type: "MAIN", year: 2024, session: "January", date: "27_Jan", shift: 2, url: "https://links.mathongo.com/2rtB" },
  { type: "MAIN", year: 2024, session: "January", date: "29_Jan", shift: 1, url: "https://links.mathongo.com/Oe6L" },
  { type: "MAIN", year: 2024, session: "January", date: "29_Jan", shift: 2, url: "https://links.mathongo.com/Be5F" },
  { type: "MAIN", year: 2024, session: "January", date: "30_Jan", shift: 1, url: "https://links.mathongo.com/ZrrZ" },
  { type: "MAIN", year: 2024, session: "January", date: "30_Jan", shift: 2, url: "https://links.mathongo.com/urqP" },
  { type: "MAIN", year: 2024, session: "January", date: "31_Jan", shift: 1, url: "https://links.mathongo.com/0rqQ" },
  { type: "MAIN", year: 2024, session: "January", date: "31_Jan", shift: 2, url: "https://links.mathongo.com/YreE" },
  { type: "MAIN", year: 2024, session: "January", date: "01_Feb", shift: 1, url: "https://links.mathongo.com/JeHi" },
  { type: "MAIN", year: 2024, session: "January", date: "01_Feb", shift: 2, url: "https://links.mathongo.com/EeXb" },

  // 2024 April
  { type: "MAIN", year: 2024, session: "April", date: "04_Apr", shift: 1, url: "https://links.mathongo.com/1eFi" },
  { type: "MAIN", year: 2024, session: "April", date: "04_Apr", shift: 2, url: "https://links.mathongo.com/ke3T" },
  { type: "MAIN", year: 2024, session: "April", date: "05_Apr", shift: 1, url: "https://links.mathongo.com/Qe4c" },
  { type: "MAIN", year: 2024, session: "April", date: "05_Apr", shift: 2, url: "https://links.mathongo.com/ve7K" },
  { type: "MAIN", year: 2024, session: "April", date: "06_Apr", shift: 1, url: "https://links.mathongo.com/be1q" },
  { type: "MAIN", year: 2024, session: "April", date: "06_Apr", shift: 2, url: "https://links.mathongo.com/We8M" },
  { type: "MAIN", year: 2024, session: "April", date: "08_Apr", shift: 1, url: "https://links.mathongo.com/Te2Q" },
  { type: "MAIN", year: 2024, session: "April", date: "08_Apr", shift: 2, url: "https://links.mathongo.com/UeMQ" },
  { type: "MAIN", year: 2024, session: "April", date: "09_Apr", shift: 1, url: "https://links.mathongo.com/QeNi" },
  { type: "MAIN", year: 2024, session: "April", date: "09_Apr", shift: 2, url: "https://links.mathongo.com/Ee9x" },

  // 2023 January
  { type: "MAIN", year: 2023, session: "January", date: "24_Jan", shift: 1, url: "https://links.mathongo.com/FeSn" },
  { type: "MAIN", year: 2023, session: "January", date: "24_Jan", shift: 2, url: "https://links.mathongo.com/0eGa" },
  { type: "MAIN", year: 2023, session: "January", date: "25_Jan", shift: 1, url: "https://links.mathongo.com/reDl" },
  { type: "MAIN", year: 2023, session: "January", date: "25_Jan", shift: 2, url: "https://links.mathongo.com/ueKo" },
  { type: "MAIN", year: 2023, session: "January", date: "29_Jan", shift: 1, url: "https://links.mathongo.com/9eZR" },
  { type: "MAIN", year: 2023, session: "January", date: "29_Jan", shift: 2, url: "https://links.mathongo.com/NeJV" },
  { type: "MAIN", year: 2023, session: "January", date: "30_Jan", shift: 1, url: "https://links.mathongo.com/WeCF" },
  { type: "MAIN", year: 2023, session: "January", date: "30_Jan", shift: 2, url: "https://links.mathongo.com/7eLF" },
  { type: "MAIN", year: 2023, session: "January", date: "31_Jan", shift: 1, url: "https://links.mathongo.com/teB4" },
  { type: "MAIN", year: 2023, session: "January", date: "31_Jan", shift: 2, url: "https://links.mathongo.com/teVX" },
  { type: "MAIN", year: 2023, session: "January", date: "01_Feb", shift: 1, url: "https://links.mathongo.com/Wecg" },
  { type: "MAIN", year: 2023, session: "January", date: "01_Feb", shift: 2, url: "https://links.mathongo.com/qevi" },

  // 2023 April
  { type: "MAIN", year: 2023, session: "April", date: "06_Apr", shift: 1, url: "https://links.mathongo.com/CemG" },
  { type: "MAIN", year: 2023, session: "April", date: "06_Apr", shift: 2, url: "https://links.mathongo.com/VeIY" },
  { type: "MAIN", year: 2023, session: "April", date: "08_Apr", shift: 1, url: "https://links.mathongo.com/AePp" },
  { type: "MAIN", year: 2023, session: "April", date: "08_Apr", shift: 2, url: "https://links.mathongo.com/ueOJ" },
  { type: "MAIN", year: 2023, session: "April", date: "10_Apr", shift: 1, url: "https://links.mathongo.com/peTO" },
  { type: "MAIN", year: 2023, session: "April", date: "10_Apr", shift: 2, url: "https://links.mathongo.com/8eYy" },
  { type: "MAIN", year: 2023, session: "April", date: "11_Apr", shift: 1, url: "https://links.mathongo.com/heA9" },
  { type: "MAIN", year: 2023, session: "April", date: "11_Apr", shift: 2, url: "https://links.mathongo.com/peEc" },
  { type: "MAIN", year: 2023, session: "April", date: "12_Apr", shift: 1, url: "https://links.mathongo.com/jeUu" },
  { type: "MAIN", year: 2023, session: "April", date: "13_Apr", shift: 1, url: "https://links.mathongo.com/8eR2" },
  { type: "MAIN", year: 2023, session: "April", date: "13_Apr", shift: 2, url: "https://links.mathongo.com/7eQ6" },
  { type: "MAIN", year: 2023, session: "April", date: "15_Apr", shift: 1, url: "https://links.mathongo.com/veWO" },

  // 2022 June
  { type: "MAIN", year: 2022, session: "June", date: "24_Jun", shift: 1, url: "https://links.mathongo.com/6ews" },
  { type: "MAIN", year: 2022, session: "June", date: "24_Jun", shift: 2, url: "https://links.mathongo.com/FeeC" },
  { type: "MAIN", year: 2022, session: "June", date: "25_Jun", shift: 1, url: "https://links.mathongo.com/cw64" },
  { type: "MAIN", year: 2022, session: "June", date: "25_Jun", shift: 2, url: "https://links.mathongo.com/UerM" },
  { type: "MAIN", year: 2022, session: "June", date: "26_Jun", shift: 1, url: "https://links.mathongo.com/7eaY" },
  { type: "MAIN", year: 2022, session: "June", date: "26_Jun", shift: 2, url: "https://links.mathongo.com/Oep9" },
  { type: "MAIN", year: 2022, session: "June", date: "27_Jun", shift: 1, url: "https://links.mathongo.com/hege" },
  { type: "MAIN", year: 2022, session: "June", date: "27_Jun", shift: 2, url: "https://links.mathongo.com/zefX" },
  { type: "MAIN", year: 2022, session: "June", date: "28_Jun", shift: 1, url: "https://links.mathongo.com/sen0" },
  { type: "MAIN", year: 2022, session: "June", date: "28_Jun", shift: 2, url: "https://links.mathongo.com/sexw" },
  { type: "MAIN", year: 2022, session: "June", date: "29_Jun", shift: 1, url: "https://links.mathongo.com/gebc" },
  { type: "MAIN", year: 2022, session: "June", date: "29_Jun", shift: 2, url: "https://links.mathongo.com/zezZ" },

  // 2022 July
  { type: "MAIN", year: 2022, session: "July", date: "25_Jul", shift: 1, url: "https://links.mathongo.com/keij" },
  { type: "MAIN", year: 2022, session: "July", date: "25_Jul", shift: 2, url: "https://links.mathongo.com/Rw5W" },
  { type: "MAIN", year: 2022, session: "July", date: "26_Jul", shift: 1, url: "https://links.mathongo.com/Heu7" },
  { type: "MAIN", year: 2022, session: "July", date: "26_Jul", shift: 2, url: "https://links.mathongo.com/kedY" },
  { type: "MAIN", year: 2022, session: "July", date: "27_Jul", shift: 1, url: "https://links.mathongo.com/wese" },
  { type: "MAIN", year: 2022, session: "July", date: "27_Jul", shift: 2, url: "https://links.mathongo.com/qejq" },
  { type: "MAIN", year: 2022, session: "July", date: "28_Jul", shift: 1, url: "https://links.mathongo.com/Geoa" },
  { type: "MAIN", year: 2022, session: "July", date: "28_Jul", shift: 2, url: "https://links.mathongo.com/AehM" },
  { type: "MAIN", year: 2022, session: "July", date: "29_Jul", shift: 1, url: "https://links.mathongo.com/Eels" },
  { type: "MAIN", year: 2022, session: "July", date: "29_Jul", shift: 2, url: "https://links.mathongo.com/QekQ" },

  // 2021 February
  { type: "MAIN", year: 2021, session: "February", date: "24_Feb", shift: 1, url: "https://links.mathongo.com/VwRD" },
  { type: "MAIN", year: 2021, session: "February", date: "24_Feb", shift: 2, url: "https://links.mathongo.com/jwrx" },
  { type: "MAIN", year: 2021, session: "February", date: "25_Feb", shift: 1, url: "https://links.mathongo.com/ywqv" },
  { type: "MAIN", year: 2021, session: "February", date: "25_Feb", shift: 2, url: "https://links.mathongo.com/XwqU" },
  { type: "MAIN", year: 2021, session: "February", date: "26_Feb", shift: 1, url: "https://links.mathongo.com/9wPu" },
  { type: "MAIN", year: 2021, session: "February", date: "26_Feb", shift: 2, url: "https://links.mathongo.com/fwMI" },

  // 2021 March
  { type: "MAIN", year: 2021, session: "March", date: "16_Mar", shift: 1, url: "https://links.mathongo.com/EwML" },
  { type: "MAIN", year: 2021, session: "March", date: "16_Mar", shift: 2, url: "https://links.mathongo.com/KwHP" },
  { type: "MAIN", year: 2021, session: "March", date: "17_Mar", shift: 1, url: "https://links.mathongo.com/LwFp" },
  { type: "MAIN", year: 2021, session: "March", date: "17_Mar", shift: 2, url: "https://links.mathongo.com/Uwrx" },
  { type: "MAIN", year: 2021, session: "March", date: "18_Mar", shift: 1, url: "https://links.mathongo.com/3wqm" },
  { type: "MAIN", year: 2021, session: "March", date: "18_Mar", shift: 2, url: "https://links.mathongo.com/KwqN" },

  // 2021 July
  { type: "MAIN", year: 2021, session: "July", date: "20_Jul", shift: 1, url: "https://links.mathongo.com/WwPR" },
  { type: "MAIN", year: 2021, session: "July", date: "20_Jul", shift: 2, url: "https://links.mathongo.com/AwN0" },
  { type: "MAIN", year: 2021, session: "July", date: "22_Jul", shift: 1, url: "https://links.mathongo.com/Pwjv" },
  { type: "MAIN", year: 2021, session: "July", date: "22_Jul", shift: 2, url: "https://links.mathongo.com/owhi" },
  { type: "MAIN", year: 2021, session: "July", date: "25_Jul", shift: 1, url: "https://links.mathongo.com/hwha" },
  { type: "MAIN", year: 2021, session: "July", date: "25_Jul", shift: 2, url: "https://links.mathongo.com/Swg1" },
  { type: "MAIN", year: 2021, session: "July", date: "27_Jul", shift: 1, url: "https://links.mathongo.com/UwgW" },
  { type: "MAIN", year: 2021, session: "July", date: "27_Jul", shift: 2, url: "https://links.mathongo.com/iwfO" },

  // 2021 August
  { type: "MAIN", year: 2021, session: "August", date: "26_Aug", shift: 1, url: "https://links.mathongo.com/6web" },
  { type: "MAIN", year: 2021, session: "August", date: "26_Aug", shift: 2, url: "https://links.mathongo.com/swdw" },
  { type: "MAIN", year: 2021, session: "August", date: "27_Aug", shift: 1, url: "https://links.mathongo.com/Twd3" },
  { type: "MAIN", year: 2021, session: "August", date: "27_Aug", shift: 2, url: "https://links.mathongo.com/GwcS" },
  { type: "MAIN", year: 2021, session: "August", date: "31_Aug", shift: 1, url: "https://links.mathongo.com/Twcz" },
  { type: "MAIN", year: 2021, session: "August", date: "31_Aug", shift: 2, url: "https://links.mathongo.com/uwbC" },

  // 2020 January
  { type: "MAIN", year: 2020, session: "January", date: "07_Jan", shift: 1, url: "https://links.mathongo.com/GwE5" },
  { type: "MAIN", year: 2020, session: "January", date: "07_Jan", shift: 2, url: "https://links.mathongo.com/4wmk" },
  { type: "MAIN", year: 2020, session: "January", date: "08_Jan", shift: 1, url: "https://links.mathongo.com/DwY6" },
  { type: "MAIN", year: 2020, session: "January", date: "08_Jan", shift: 2, url: "https://links.mathongo.com/XwSh" },
  { type: "MAIN", year: 2020, session: "January", date: "09_Jan", shift: 1, url: "https://links.mathongo.com/RwGO" },
  { type: "MAIN", year: 2020, session: "January", date: "09_Jan", shift: 2, url: "https://links.mathongo.com/SwFb" },

  // 2020 September
  { type: "MAIN", year: 2020, session: "September", date: "02_Sep", shift: 1, url: "https://links.mathongo.com/Vwjv" },
  { type: "MAIN", year: 2020, session: "September", date: "02_Sep", shift: 2, url: "https://links.mathongo.com/Dwhp" },
  { type: "MAIN", year: 2020, session: "September", date: "03_Sep", shift: 1, url: "https://links.mathongo.com/wwBF" },
  { type: "MAIN", year: 2020, session: "September", date: "03_Sep", shift: 2, url: "https://links.mathongo.com/4wxE" },
  { type: "MAIN", year: 2020, session: "September", date: "04_Sep", shift: 1, url: "https://links.mathongo.com/wwN3" },
  { type: "MAIN", year: 2020, session: "September", date: "04_Sep", shift: 2, url: "https://links.mathongo.com/wwgV" },
  { type: "MAIN", year: 2020, session: "September", date: "05_Sep", shift: 1, url: "https://links.mathongo.com/BwQF" },
  { type: "MAIN", year: 2020, session: "September", date: "05_Sep", shift: 2, url: "https://links.mathongo.com/HwWG" },
  { type: "MAIN", year: 2020, session: "September", date: "06_Sep", shift: 1, url: "https://links.mathongo.com/ywRw" },
  { type: "MAIN", year: 2020, session: "September", date: "06_Sep", shift: 2, url: "https://links.mathongo.com/cwT1" },

  // 2019 January
  { type: "MAIN", year: 2019, session: "January", date: "09_Jan", shift: 1, url: "https://links.mathongo.com/nwal" },
  { type: "MAIN", year: 2019, session: "January", date: "09_Jan", shift: 2, url: "https://links.mathongo.com/fwfI" },
  { type: "MAIN", year: 2019, session: "January", date: "10_Jan", shift: 1, url: "https://links.mathongo.com/8wrM" },
  { type: "MAIN", year: 2019, session: "January", date: "10_Jan", shift: 2, url: "https://links.mathongo.com/jwcF" },
  { type: "MAIN", year: 2019, session: "January", date: "11_Jan", shift: 1, url: "https://links.mathongo.com/swbS" },
  { type: "MAIN", year: 2019, session: "January", date: "11_Jan", shift: 2, url: "https://links.mathongo.com/1wz6" },
  { type: "MAIN", year: 2019, session: "January", date: "12_Jan", shift: 1, url: "https://links.mathongo.com/ewnT" },
  { type: "MAIN", year: 2019, session: "January", date: "12_Jan", shift: 2, url: "https://links.mathongo.com/5wvc" },

  // 2019 April
  { type: "MAIN", year: 2019, session: "April", date: "08_Apr", shift: 1, url: "https://links.mathongo.com/Qwta" },
  { type: "MAIN", year: 2019, session: "April", date: "08_Apr", shift: 2, url: "https://links.mathongo.com/Mwpj" },
  { type: "MAIN", year: 2019, session: "April", date: "09_Apr", shift: 1, url: "https://links.mathongo.com/cweI" },
  { type: "MAIN", year: 2019, session: "April", date: "09_Apr", shift: 2, url: "https://links.mathongo.com/Zwuj" },
  { type: "MAIN", year: 2019, session: "April", date: "10_Apr", shift: 1, url: "https://links.mathongo.com/cwyh" },
  { type: "MAIN", year: 2019, session: "April", date: "10_Apr", shift: 2, url: "https://links.mathongo.com/ywoA" },
  { type: "MAIN", year: 2019, session: "April", date: "12_Apr", shift: 1, url: "https://links.mathongo.com/Uwl9" },
  { type: "MAIN", year: 2019, session: "April", date: "12_Apr", shift: 2, url: "https://links.mathongo.com/5wkc" },
];

// Combine all papers
const allPapers: PaperInfo[] = [...advancedPapers, ...mainPapers];

function getFilename(paper: PaperInfo): string {
  if (paper.type === "ADVANCED") {
    return `JEE_Advanced_${paper.year}_Paper${paper.paper}.pdf`;
  }
  return `JEE_Main_${paper.year}_${paper.date}_Shift${paper.shift}.pdf`;
}

function getUrl(paper: PaperInfo): string {
  return paper.url;
}

async function followRedirects(url: string, maxRedirects = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      }
    }, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (maxRedirects === 0) {
          reject(new Error("Too many redirects"));
          return;
        }
        const redirectUrl = response.headers.location.startsWith("http")
          ? response.headers.location
          : new URL(response.headers.location, url).toString();
        resolve(followRedirects(redirectUrl, maxRedirects - 1));
      } else {
        resolve(url);
      }
    });

    request.on("error", reject);
    request.end();
  });
}

async function downloadFile(url: string, filepath: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      // Follow redirects to get final URL
      const finalUrl = await followRedirects(url);
      const protocol = finalUrl.startsWith("https") ? https : http;

      const request = protocol.get(finalUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
      }, (response) => {
        if (response.statusCode !== 200) {
          console.log(`    HTTP ${response.statusCode}`);
          resolve(false);
          return;
        }

        const contentType = response.headers["content-type"] || "";
        if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
          console.log(`    Not a PDF (${contentType})`);
          resolve(false);
          return;
        }

        const file = fs.createWriteStream(filepath);
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(true);
        });

        file.on("error", (err) => {
          fs.unlink(filepath, () => {});
          console.log(`    Write error: ${err.message}`);
          resolve(false);
        });
      });

      request.on("error", (err) => {
        console.log(`    Request error: ${err.message}`);
        resolve(false);
      });

      request.end();
    } catch (err) {
      console.log(`    Error: ${err}`);
      resolve(false);
    }
  });
}

async function main() {
  console.log(`\nJEE Paper Downloader`);
  console.log(`====================`);
  console.log(`Total papers configured: ${allPapers.length}`);
  console.log(`  - JEE Advanced: ${advancedPapers.length}`);
  console.log(`  - JEE Main: ${mainPapers.length}`);
  console.log(`Output directory: ${EXAM_PAPERS_DIR}\n`);

  // Ensure directory exists
  if (!fs.existsSync(EXAM_PAPERS_DIR)) {
    fs.mkdirSync(EXAM_PAPERS_DIR, { recursive: true });
  }

  // Check which papers already exist
  const existingFiles = fs.readdirSync(EXAM_PAPERS_DIR);
  const toDownload = allPapers.filter(p => !existingFiles.includes(getFilename(p)));

  const advancedToDownload = toDownload.filter(p => p.type === "ADVANCED").length;
  const mainToDownload = toDownload.filter(p => p.type === "MAIN").length;

  console.log(`Already downloaded: ${allPapers.length - toDownload.length}`);
  console.log(`Need to download: ${toDownload.length}`);
  console.log(`  - JEE Advanced: ${advancedToDownload}`);
  console.log(`  - JEE Main: ${mainToDownload}\n`);

  if (toDownload.length === 0) {
    console.log("All papers already downloaded!");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const paper of toDownload) {
    const filename = getFilename(paper);
    const filepath = path.join(EXAM_PAPERS_DIR, filename);

    console.log(`Downloading: ${filename}`);
    console.log(`  URL: ${paper.url}`);

    const downloaded = await downloadFile(paper.url, filepath);

    if (downloaded) {
      const stats = fs.statSync(filepath);
      console.log(`  Success! (${(stats.size / 1024).toFixed(0)} KB)`);
      success++;
    } else {
      console.log(`  Failed!`);
      failed++;
    }

    // Small delay between downloads
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n--- Summary ---`);
  console.log(`Downloaded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total PDFs in folder: ${fs.readdirSync(EXAM_PAPERS_DIR).filter(f => f.endsWith(".pdf")).length}`);
}

main().catch(console.error);
