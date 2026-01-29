/**
 * Download JEE Papers from Google Drive
 */

import fs from "fs";
import path from "path";
import https from "https";

const EXAM_PAPERS_DIR = path.join(process.cwd(), "exam papers");

interface Paper {
  name: string;
  fileId: string;
}

// Extract file IDs from Google Drive URLs
const papers: Paper[] = [
  // 2023 January
  { name: "JEE_Main_2023_Jan_24_Shift1.pdf", fileId: "1cpZZt42efK-vyby2m33Z0Wa9rTg43rKr" },
  { name: "JEE_Main_2023_Jan_24_Shift2.pdf", fileId: "1zltahiYfcVFy3q7IPGD04mfScMwKMW8m" },
  { name: "JEE_Main_2023_Jan_29_Shift1.pdf", fileId: "1-TU2sr80KS_CKj5E1riDh7f6xMKnhv5U" },
  { name: "JEE_Main_2023_Jan_29_Shift2.pdf", fileId: "13KfelctECwXSaEb5jQjK2XNp-qboB0e3" },
  { name: "JEE_Main_2023_Jan_30_Shift1.pdf", fileId: "1_Y91L-Y3EMl7FAOiCyOHBPWLu0-zcShP" },
  { name: "JEE_Main_2023_Jan_30_Shift2.pdf", fileId: "1x6M2odwre7kY3y-s-7Xi73AfZZEPN75e" },
  { name: "JEE_Main_2023_Jan_31_Shift1.pdf", fileId: "16RjFiV06puta3G8D8QqrW6b1DQ3w48cS" },
  { name: "JEE_Main_2023_Jan_31_Shift2.pdf", fileId: "1BGvEZb372QCeajTJYQEHik1jtXG1EJ2F" },
];

async function downloadFromGDrive(fileId: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    console.log(`  Fetching: ${downloadUrl}`);

    const request = https.get(downloadUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 303) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`  Following redirect...`);
          https.get(redirectUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
          }, (res2) => {
            if (res2.statusCode !== 200) {
              console.log(`  HTTP ${res2.statusCode}`);
              resolve(false);
              return;
            }
            const file = fs.createWriteStream(filepath);
            res2.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve(true);
            });
          }).on("error", () => resolve(false));
        } else {
          resolve(false);
        }
        return;
      }

      if (response.statusCode !== 200) {
        console.log(`  HTTP ${response.statusCode}`);
        resolve(false);
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(true);
      });
      file.on("error", () => {
        fs.unlink(filepath, () => {});
        resolve(false);
      });
    });

    request.on("error", (err) => {
      console.log(`  Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  console.log(`\nGoogle Drive Paper Downloader`);
  console.log(`=============================`);
  console.log(`Papers to download: ${papers.length}\n`);

  let success = 0;
  let failed = 0;

  for (const paper of papers) {
    const filepath = path.join(EXAM_PAPERS_DIR, paper.name);

    if (fs.existsSync(filepath)) {
      console.log(`Skipping (exists): ${paper.name}`);
      continue;
    }

    console.log(`Downloading: ${paper.name}`);
    const ok = await downloadFromGDrive(paper.fileId, filepath);

    if (ok && fs.existsSync(filepath)) {
      const size = fs.statSync(filepath).size;
      if (size > 10000) {
        console.log(`  Success! (${(size / 1024).toFixed(0)} KB)`);
        success++;
      } else {
        // Too small, probably HTML error page
        fs.unlinkSync(filepath);
        console.log(`  Failed (file too small)`);
        failed++;
      }
    } else {
      failed++;
      console.log(`  Failed!`);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n--- Summary ---`);
  console.log(`Downloaded: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
