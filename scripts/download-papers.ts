/**
 * JEE Paper Download Script
 * Downloads JEE Main papers from MathonGo
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const EXAM_PAPERS_DIR = path.join(process.cwd(), "exam papers");

interface PaperInfo {
  year: number;
  session: string;
  date: string;
  shift: number;
  url: string;
}

// Papers from MathonGo
const papers: PaperInfo[] = [
  // 2024 January
  { year: 2024, session: "January", date: "27_Jan", shift: 1, url: "https://links.mathongo.com/Qe0X" },
  { year: 2024, session: "January", date: "27_Jan", shift: 2, url: "https://links.mathongo.com/2rtB" },
  { year: 2024, session: "January", date: "29_Jan", shift: 1, url: "https://links.mathongo.com/Oe6L" },
  { year: 2024, session: "January", date: "29_Jan", shift: 2, url: "https://links.mathongo.com/Be5F" },
  { year: 2024, session: "January", date: "30_Jan", shift: 1, url: "https://links.mathongo.com/ZrrZ" },
  { year: 2024, session: "January", date: "30_Jan", shift: 2, url: "https://links.mathongo.com/urqP" },
  { year: 2024, session: "January", date: "31_Jan", shift: 1, url: "https://links.mathongo.com/0rqQ" },
  { year: 2024, session: "January", date: "31_Jan", shift: 2, url: "https://links.mathongo.com/YreE" },
  { year: 2024, session: "January", date: "01_Feb", shift: 1, url: "https://links.mathongo.com/JeHi" },
  { year: 2024, session: "January", date: "01_Feb", shift: 2, url: "https://links.mathongo.com/EeXb" },

  // 2024 April
  { year: 2024, session: "April", date: "04_Apr", shift: 1, url: "https://links.mathongo.com/1eFi" },
  { year: 2024, session: "April", date: "04_Apr", shift: 2, url: "https://links.mathongo.com/ke3T" },
  { year: 2024, session: "April", date: "05_Apr", shift: 1, url: "https://links.mathongo.com/Qe4c" },
  { year: 2024, session: "April", date: "05_Apr", shift: 2, url: "https://links.mathongo.com/ve7K" },
  { year: 2024, session: "April", date: "06_Apr", shift: 1, url: "https://links.mathongo.com/be1q" },
  { year: 2024, session: "April", date: "06_Apr", shift: 2, url: "https://links.mathongo.com/We8M" },
  { year: 2024, session: "April", date: "08_Apr", shift: 1, url: "https://links.mathongo.com/Te2Q" },
  { year: 2024, session: "April", date: "08_Apr", shift: 2, url: "https://links.mathongo.com/UeMQ" },
  { year: 2024, session: "April", date: "09_Apr", shift: 1, url: "https://links.mathongo.com/QeNi" },
  { year: 2024, session: "April", date: "09_Apr", shift: 2, url: "https://links.mathongo.com/Ee9x" },

  // 2023 January
  { year: 2023, session: "January", date: "24_Jan", shift: 1, url: "https://links.mathongo.com/FeSn" },
  { year: 2023, session: "January", date: "24_Jan", shift: 2, url: "https://links.mathongo.com/0eGa" },
  { year: 2023, session: "January", date: "25_Jan", shift: 1, url: "https://links.mathongo.com/reDl" },
  { year: 2023, session: "January", date: "25_Jan", shift: 2, url: "https://links.mathongo.com/ueKo" },
  { year: 2023, session: "January", date: "29_Jan", shift: 1, url: "https://links.mathongo.com/9eZR" },
  { year: 2023, session: "January", date: "29_Jan", shift: 2, url: "https://links.mathongo.com/NeJV" },
  { year: 2023, session: "January", date: "30_Jan", shift: 1, url: "https://links.mathongo.com/WeCF" },
  { year: 2023, session: "January", date: "30_Jan", shift: 2, url: "https://links.mathongo.com/7eLF" },
  { year: 2023, session: "January", date: "31_Jan", shift: 1, url: "https://links.mathongo.com/teB4" },
  { year: 2023, session: "January", date: "31_Jan", shift: 2, url: "https://links.mathongo.com/teVX" },
  { year: 2023, session: "January", date: "01_Feb", shift: 1, url: "https://links.mathongo.com/Wecg" },
  { year: 2023, session: "January", date: "01_Feb", shift: 2, url: "https://links.mathongo.com/qevi" },

  // 2023 April
  { year: 2023, session: "April", date: "06_Apr", shift: 1, url: "https://links.mathongo.com/CemG" },
  { year: 2023, session: "April", date: "06_Apr", shift: 2, url: "https://links.mathongo.com/VeIY" },
  { year: 2023, session: "April", date: "08_Apr", shift: 1, url: "https://links.mathongo.com/AePp" },
  { year: 2023, session: "April", date: "08_Apr", shift: 2, url: "https://links.mathongo.com/ueOJ" },
  { year: 2023, session: "April", date: "10_Apr", shift: 1, url: "https://links.mathongo.com/peTO" },
  { year: 2023, session: "April", date: "10_Apr", shift: 2, url: "https://links.mathongo.com/8eYy" },
  { year: 2023, session: "April", date: "11_Apr", shift: 1, url: "https://links.mathongo.com/heA9" },
  { year: 2023, session: "April", date: "11_Apr", shift: 2, url: "https://links.mathongo.com/peEc" },
  { year: 2023, session: "April", date: "12_Apr", shift: 1, url: "https://links.mathongo.com/jeUu" },
  { year: 2023, session: "April", date: "13_Apr", shift: 1, url: "https://links.mathongo.com/8eR2" },
  { year: 2023, session: "April", date: "13_Apr", shift: 2, url: "https://links.mathongo.com/7eQ6" },
  { year: 2023, session: "April", date: "15_Apr", shift: 1, url: "https://links.mathongo.com/veWO" },

  // 2022 June
  { year: 2022, session: "June", date: "24_Jun", shift: 1, url: "https://links.mathongo.com/6ews" },
  { year: 2022, session: "June", date: "24_Jun", shift: 2, url: "https://links.mathongo.com/FeeC" },
  { year: 2022, session: "June", date: "25_Jun", shift: 1, url: "https://links.mathongo.com/cw64" },
  { year: 2022, session: "June", date: "25_Jun", shift: 2, url: "https://links.mathongo.com/UerM" },
  { year: 2022, session: "June", date: "26_Jun", shift: 1, url: "https://links.mathongo.com/7eaY" },
  { year: 2022, session: "June", date: "26_Jun", shift: 2, url: "https://links.mathongo.com/Oep9" },
  { year: 2022, session: "June", date: "27_Jun", shift: 1, url: "https://links.mathongo.com/hege" },
  { year: 2022, session: "June", date: "27_Jun", shift: 2, url: "https://links.mathongo.com/zefX" },
  { year: 2022, session: "June", date: "28_Jun", shift: 1, url: "https://links.mathongo.com/sen0" },
  { year: 2022, session: "June", date: "28_Jun", shift: 2, url: "https://links.mathongo.com/sexw" },
  { year: 2022, session: "June", date: "29_Jun", shift: 1, url: "https://links.mathongo.com/gebc" },
  { year: 2022, session: "June", date: "29_Jun", shift: 2, url: "https://links.mathongo.com/zezZ" },

  // 2022 July
  { year: 2022, session: "July", date: "25_Jul", shift: 1, url: "https://links.mathongo.com/keij" },
  { year: 2022, session: "July", date: "25_Jul", shift: 2, url: "https://links.mathongo.com/Rw5W" },
  { year: 2022, session: "July", date: "26_Jul", shift: 1, url: "https://links.mathongo.com/Heu7" },
  { year: 2022, session: "July", date: "26_Jul", shift: 2, url: "https://links.mathongo.com/kedY" },
  { year: 2022, session: "July", date: "27_Jul", shift: 1, url: "https://links.mathongo.com/wese" },
  { year: 2022, session: "July", date: "27_Jul", shift: 2, url: "https://links.mathongo.com/qejq" },
  { year: 2022, session: "July", date: "28_Jul", shift: 1, url: "https://links.mathongo.com/Geoa" },
  { year: 2022, session: "July", date: "28_Jul", shift: 2, url: "https://links.mathongo.com/AehM" },
  { year: 2022, session: "July", date: "29_Jul", shift: 1, url: "https://links.mathongo.com/Eels" },
  { year: 2022, session: "July", date: "29_Jul", shift: 2, url: "https://links.mathongo.com/QekQ" },

  // 2020 January
  { year: 2020, session: "January", date: "07_Jan", shift: 1, url: "https://links.mathongo.com/GwE5" },
  { year: 2020, session: "January", date: "07_Jan", shift: 2, url: "https://links.mathongo.com/4wmk" },
  { year: 2020, session: "January", date: "08_Jan", shift: 1, url: "https://links.mathongo.com/DwY6" },
  { year: 2020, session: "January", date: "08_Jan", shift: 2, url: "https://links.mathongo.com/XwSh" },
  { year: 2020, session: "January", date: "09_Jan", shift: 1, url: "https://links.mathongo.com/RwGO" },
  { year: 2020, session: "January", date: "09_Jan", shift: 2, url: "https://links.mathongo.com/SwFb" },

  // 2020 September
  { year: 2020, session: "September", date: "02_Sep", shift: 1, url: "https://links.mathongo.com/Vwjv" },
  { year: 2020, session: "September", date: "02_Sep", shift: 2, url: "https://links.mathongo.com/Dwhp" },
  { year: 2020, session: "September", date: "03_Sep", shift: 1, url: "https://links.mathongo.com/wwBF" },
  { year: 2020, session: "September", date: "03_Sep", shift: 2, url: "https://links.mathongo.com/4wxE" },
  { year: 2020, session: "September", date: "04_Sep", shift: 1, url: "https://links.mathongo.com/wwN3" },
  { year: 2020, session: "September", date: "04_Sep", shift: 2, url: "https://links.mathongo.com/wwgV" },
  { year: 2020, session: "September", date: "05_Sep", shift: 1, url: "https://links.mathongo.com/BwQF" },
  { year: 2020, session: "September", date: "05_Sep", shift: 2, url: "https://links.mathongo.com/HwWG" },
  { year: 2020, session: "September", date: "06_Sep", shift: 1, url: "https://links.mathongo.com/ywRw" },
  { year: 2020, session: "September", date: "06_Sep", shift: 2, url: "https://links.mathongo.com/cwT1" },

  // 2019 January
  { year: 2019, session: "January", date: "09_Jan", shift: 1, url: "https://links.mathongo.com/nwal" },
  { year: 2019, session: "January", date: "09_Jan", shift: 2, url: "https://links.mathongo.com/fwfI" },
  { year: 2019, session: "January", date: "10_Jan", shift: 1, url: "https://links.mathongo.com/8wrM" },
  { year: 2019, session: "January", date: "10_Jan", shift: 2, url: "https://links.mathongo.com/jwcF" },
  { year: 2019, session: "January", date: "11_Jan", shift: 1, url: "https://links.mathongo.com/swbS" },
  { year: 2019, session: "January", date: "11_Jan", shift: 2, url: "https://links.mathongo.com/1wz6" },
  { year: 2019, session: "January", date: "12_Jan", shift: 1, url: "https://links.mathongo.com/ewnT" },
  { year: 2019, session: "January", date: "12_Jan", shift: 2, url: "https://links.mathongo.com/5wvc" },

  // 2019 April
  { year: 2019, session: "April", date: "08_Apr", shift: 1, url: "https://links.mathongo.com/Qwta" },
  { year: 2019, session: "April", date: "08_Apr", shift: 2, url: "https://links.mathongo.com/Mwpj" },
  { year: 2019, session: "April", date: "09_Apr", shift: 1, url: "https://links.mathongo.com/cweI" },
  { year: 2019, session: "April", date: "09_Apr", shift: 2, url: "https://links.mathongo.com/Zwuj" },
  { year: 2019, session: "April", date: "10_Apr", shift: 1, url: "https://links.mathongo.com/cwyh" },
  { year: 2019, session: "April", date: "10_Apr", shift: 2, url: "https://links.mathongo.com/ywoA" },
  { year: 2019, session: "April", date: "12_Apr", shift: 1, url: "https://links.mathongo.com/Uwl9" },
  { year: 2019, session: "April", date: "12_Apr", shift: 2, url: "https://links.mathongo.com/5wkc" },
];

function getFilename(paper: PaperInfo): string {
  return `JEE_Main_${paper.year}_${paper.date}_Shift${paper.shift}.pdf`;
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
  console.log(`Total papers to download: ${papers.length}`);
  console.log(`Output directory: ${EXAM_PAPERS_DIR}\n`);

  // Check which papers already exist
  const existingFiles = fs.readdirSync(EXAM_PAPERS_DIR);
  const toDownload = papers.filter(p => !existingFiles.includes(getFilename(p)));

  console.log(`Already downloaded: ${papers.length - toDownload.length}`);
  console.log(`Need to download: ${toDownload.length}\n`);

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
  console.log(`Total in folder: ${fs.readdirSync(EXAM_PAPERS_DIR).filter(f => f.endsWith(".pdf")).length}`);
}

main().catch(console.error);
