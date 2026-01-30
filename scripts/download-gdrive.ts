/**
 * JEE Paper Download Script - Google Drive Sources
 * Downloads JEE Main and Advanced papers from Google Drive links
 * Source: MyStudyCart comprehensive archives
 *
 * Usage: npx tsx scripts/download-gdrive.ts
 */

import fs from "fs";
import path from "path";
import https from "https";

const EXAM_PAPERS_DIR = path.join(process.cwd(), "exam papers");

// Ensure directory exists
if (!fs.existsSync(EXAM_PAPERS_DIR)) {
  fs.mkdirSync(EXAM_PAPERS_DIR, { recursive: true });
}

interface Paper {
  name: string;
  fileId: string;
  type: "MAIN" | "ADVANCED";
  year: number;
}

// All JEE papers from MyStudyCart Google Drive links
const papers: Paper[] = [
  // ==================== JEE ADVANCED 2015-2018 ====================

  { name: "JEE_Advanced_2018_Paper1.pdf", type: "ADVANCED", year: 2018, fileId: "1Z2GYxh0XNxqTJpyvNBKMirZ0A9xn2WVK" },
  { name: "JEE_Advanced_2018_Paper2.pdf", type: "ADVANCED", year: 2018, fileId: "1tI4jHsyhGe8bglyNMcfYADYluKifdIFT" },
  { name: "JEE_Advanced_2017_Paper1.pdf", type: "ADVANCED", year: 2017, fileId: "1B0okg3udCOq6REB7kj4egQelWI7Ut0go" },
  { name: "JEE_Advanced_2017_Paper2.pdf", type: "ADVANCED", year: 2017, fileId: "14oROB4DzwyZq8_Thx-a2TQgGsLMGUUFn" },
  { name: "JEE_Advanced_2016_Paper1.pdf", type: "ADVANCED", year: 2016, fileId: "0B0I4YfZLhvamMHpjWW5reWkzWjA" },
  { name: "JEE_Advanced_2016_Paper2.pdf", type: "ADVANCED", year: 2016, fileId: "0B0I4YfZLhvamME1ZSGY1TWlUakU" },
  { name: "JEE_Advanced_2015_Paper1.pdf", type: "ADVANCED", year: 2015, fileId: "0B0I4YfZLhvaamamNabFV0UmtDMUk" },
  { name: "JEE_Advanced_2015_Paper2.pdf", type: "ADVANCED", year: 2015, fileId: "0B0I4YfZLhvamdWh6V19IUThZSW8" },

  // ==================== JEE MAIN 2024 (April) ====================

  { name: "JEE_Main_2024_Apr_04_Shift1.pdf", type: "MAIN", year: 2024, fileId: "1kZS8wiNmkcUZWKvxYEhsWgmbtEhspiVR" },
  { name: "JEE_Main_2024_Apr_04_Shift2.pdf", type: "MAIN", year: 2024, fileId: "15LqNB0vYIJmvxIT8AIuiH-iXm8l17YlP" },
  { name: "JEE_Main_2024_Apr_05_Shift1.pdf", type: "MAIN", year: 2024, fileId: "1G7fNabtai1jcwPwnTKICwdbqwJMEA8jn" },
  { name: "JEE_Main_2024_Apr_05_Shift2.pdf", type: "MAIN", year: 2024, fileId: "1Bu5Jk059zzw97zUizd5dcJ2a0GuygmoU" },
  { name: "JEE_Main_2024_Apr_06_Shift1.pdf", type: "MAIN", year: 2024, fileId: "16gJZZbdgPXjZ-ezXGc7lrS8d12NOZI0N" },
  { name: "JEE_Main_2024_Apr_06_Shift2.pdf", type: "MAIN", year: 2024, fileId: "1vo4yWIEp-fJBi8Yu3GBaN-bOjpiMqfBf" },
  { name: "JEE_Main_2024_Apr_08_Shift1.pdf", type: "MAIN", year: 2024, fileId: "1eN2pQdi3cQUFt5xFW-SdgKFMESPb3PqF" },
  { name: "JEE_Main_2024_Apr_08_Shift2.pdf", type: "MAIN", year: 2024, fileId: "1wI7mdeGuy2Vn9bf9axey1F7fiLZlBLV9" },
  { name: "JEE_Main_2024_Apr_09_Shift1.pdf", type: "MAIN", year: 2024, fileId: "1dfgojZhgGjvZ32MuozZ8wi6hlWIawpsb" },
  { name: "JEE_Main_2024_Apr_09_Shift2.pdf", type: "MAIN", year: 2024, fileId: "1tOH9uLcciv22y9-gnfbNsTW14BzQ8Cq5" },

  // ==================== JEE MAIN 2023 (January) ====================

  { name: "JEE_Main_2023_Jan_24_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1cpZZt42efK-vyby2m33Z0Wa9rTg43rKr" },
  { name: "JEE_Main_2023_Jan_24_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1zltahiYfcVFy3q7IPGD04mfScMwKMW8m" },
  { name: "JEE_Main_2023_Jan_25_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1HU3v372DyhqYIi2QOoB-1vk7B5qdOUfF" },
  { name: "JEE_Main_2023_Jan_25_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1TfNtgDNHmd-dAIEI6R7XFxNxPcC6bCe7" },
  { name: "JEE_Main_2023_Jan_29_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1-TU2sr80KS_CKj5E1riDh7f6xMKnhv5U" },
  { name: "JEE_Main_2023_Jan_29_Shift2.pdf", type: "MAIN", year: 2023, fileId: "13KfelctECwXSaEb5jQjK2XNp-qboB0e3" },
  { name: "JEE_Main_2023_Jan_30_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1_Y91L-Y3EMl7FAOiCyOHBPWLu0-zcShP" },
  { name: "JEE_Main_2023_Jan_30_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1x6M2odwre7kY3y-s-7Xi73AfZZEPN75e" },
  { name: "JEE_Main_2023_Jan_31_Shift1.pdf", type: "MAIN", year: 2023, fileId: "16RjFiV06puta3G8D8QqrW6b1DQ3w48cS" },
  { name: "JEE_Main_2023_Jan_31_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1BGvEZb372QCeajTJYQEHik1jtXG1EJ2F" },
  { name: "JEE_Main_2023_Feb_01_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1bgjFLgcUxrQMLw16VueCABO6kxVCP9ov" },
  { name: "JEE_Main_2023_Feb_01_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1_JcxTgdSrXeklrcFHF31CwrPNf927gnd" },

  // ==================== JEE MAIN 2023 (April) ====================

  { name: "JEE_Main_2023_Apr_06_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1Z6OWMg5d6pe-tJi_Wabt1KJjZ8K8Tm-T" },
  { name: "JEE_Main_2023_Apr_06_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1uAN5ZzjhcSsfdaTYp03VPKMMXN5_eGs8" },
  { name: "JEE_Main_2023_Apr_08_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1P8Ww1PJtmxE61tyaIVCkB9fQc7eDSRpz" },
  { name: "JEE_Main_2023_Apr_08_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1n7sVdyH8zrRTipU_GlBC4ygYwbn9koIm" },
  { name: "JEE_Main_2023_Apr_10_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1PnCCRBrf_syMkesb-vEBpKDs4rTSCTnT" },
  { name: "JEE_Main_2023_Apr_10_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1MQeGblPDgG4HFdp1TnhvhgncbXRDqWmq" },
  { name: "JEE_Main_2023_Apr_11_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1EA6ZM42NG2g38OmQTnNuiVSI-b0nHOzS" },
  { name: "JEE_Main_2023_Apr_11_Shift2.pdf", type: "MAIN", year: 2023, fileId: "18tqdGy70Ljoyz1vDQvNC6K_3JmUKSBA1" },
  { name: "JEE_Main_2023_Apr_13_Shift1.pdf", type: "MAIN", year: 2023, fileId: "1214tlVlTsHtvqO1aDm5TKxCgcj8ZC5tc" },
  { name: "JEE_Main_2023_Apr_13_Shift2.pdf", type: "MAIN", year: 2023, fileId: "1AWjBHe5ts1cN7nTDkxrMdZ98HtmO6sst" },

  // ==================== JEE MAIN 2022 (June) ====================

  { name: "JEE_Main_2022_Jun_24_Shift1.pdf", type: "MAIN", year: 2022, fileId: "1_bsI_EzonyryCqhgOP-b0VDjNKlYtf5Q" },
  { name: "JEE_Main_2022_Jun_24_Shift2.pdf", type: "MAIN", year: 2022, fileId: "18FKlMNML259ORQKirVJ9vjdK9pICd3_W" },
  { name: "JEE_Main_2022_Jun_25_Shift1.pdf", type: "MAIN", year: 2022, fileId: "18OHcaUw7N0xcolzlS4A7-BdjYKLYYU5x" },
  { name: "JEE_Main_2022_Jun_25_Shift2.pdf", type: "MAIN", year: 2022, fileId: "1DLWZbKuzpWB7k5fgpheYPJUcJn4owU81" },
  { name: "JEE_Main_2022_Jun_26_Shift1.pdf", type: "MAIN", year: 2022, fileId: "1VZwChwauXb0AwW8uT6oyY3Dl-Yvs8S-u" },
  { name: "JEE_Main_2022_Jun_26_Shift2.pdf", type: "MAIN", year: 2022, fileId: "1kB7Nv_ZptFqJlFB7RCNwa6Q01V1Du7iV" },
  { name: "JEE_Main_2022_Jun_27_Shift1.pdf", type: "MAIN", year: 2022, fileId: "122nHuAi1srgnOZaJ6vclIpq4PUPVNsk9" },
  { name: "JEE_Main_2022_Jun_27_Shift2.pdf", type: "MAIN", year: 2022, fileId: "1Bv9M7HBR-c-xevvh6Ze_jUXYDkByJp4n" },
  { name: "JEE_Main_2022_Jun_28_Shift1.pdf", type: "MAIN", year: 2022, fileId: "1MK57XaTcOPnV5PvZGnxsxBj1Ygmz2amh" },
  { name: "JEE_Main_2022_Jun_28_Shift2.pdf", type: "MAIN", year: 2022, fileId: "1zmQFz9PYP1KAAJk9hCwlJdXowu5b1uyj" },

  // ==================== JEE MAIN 2021 (February) ====================

  { name: "JEE_Main_2021_Feb_24_Shift1.pdf", type: "MAIN", year: 2021, fileId: "1yl9SPNq-WeW0Oc0-SBip3-mpzgcPqgJG" },
  { name: "JEE_Main_2021_Feb_24_Shift2.pdf", type: "MAIN", year: 2021, fileId: "1xXI3nLU49SkUfE36MBvRu8HvEI9MJclm" },
  { name: "JEE_Main_2021_Feb_25_Shift1.pdf", type: "MAIN", year: 2021, fileId: "1WFnnu-VZrRXAXoNgK-PSaqDmRJgaq0_f" },
  { name: "JEE_Main_2021_Feb_25_Shift2.pdf", type: "MAIN", year: 2021, fileId: "1vO5YDtC4s0cTPcWaXBzDmm13-txDI2f-" },
  { name: "JEE_Main_2021_Feb_26_Shift1.pdf", type: "MAIN", year: 2021, fileId: "1IzWfkBmW7fE_GofT-k2eDwBHHlFOL1T6" },
  { name: "JEE_Main_2021_Feb_26_Shift2.pdf", type: "MAIN", year: 2021, fileId: "1GOLib79BCTiK95IRsPKg9ZUkuikc_E01" },

  // ==================== JEE MAIN 2020 (January) ====================

  { name: "JEE_Main_2020_Jan_Day1_Shift1.pdf", type: "MAIN", year: 2020, fileId: "1y9_nrP-__Nt_F6sP2be6CIJK518QTW5s" },
  { name: "JEE_Main_2020_Jan_Day1_Shift2.pdf", type: "MAIN", year: 2020, fileId: "1TgrE4v7u_t2H_ru0mXXh38Ov7X0Qbcnh" },
  { name: "JEE_Main_2020_Jan_Day2_Shift1.pdf", type: "MAIN", year: 2020, fileId: "12Fxch0S-G2BPFT2X_IjgQGb3fB40em50" },
  { name: "JEE_Main_2020_Jan_Day2_Shift2.pdf", type: "MAIN", year: 2020, fileId: "1FYXriyzGEJGDansjGlN-fpk3PH9N-6IG" },
  { name: "JEE_Main_2020_Jan_Day3_Shift1.pdf", type: "MAIN", year: 2020, fileId: "1Y72nPQQpbF6VY1s72SPigxfIPh4ymrx6" },
  { name: "JEE_Main_2020_Jan_Day3_Shift2.pdf", type: "MAIN", year: 2020, fileId: "1hQD26K0xiZ7CEmgOrjVyjKFSJD38FwxX" },

  // ==================== JEE MAIN 2019 (January) ====================

  { name: "JEE_Main_2019_Jan_09_Shift1.pdf", type: "MAIN", year: 2019, fileId: "13qC6PHyIXUnm13S8VjO4VWey_6VSqcFa" },
  { name: "JEE_Main_2019_Jan_09_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1QF6U3690fs819M2esJbCHD8aMvDNHB12" },
  { name: "JEE_Main_2019_Jan_10_Shift1.pdf", type: "MAIN", year: 2019, fileId: "1SD5G4OIa8PlHUKf-A869poipoqp4Qx4I" },
  { name: "JEE_Main_2019_Jan_10_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1DNLx9p9id-QHwzgSm2fWJ7IJYHF8Fv40" },
  { name: "JEE_Main_2019_Jan_11_Shift1.pdf", type: "MAIN", year: 2019, fileId: "1QIBIk0gQ7Csj-CBWHncruTigTBYwWltM" },
  { name: "JEE_Main_2019_Jan_11_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1pNwEC5poA8yQHccMsuPIM6DrXWZLJ0Ir" },
  { name: "JEE_Main_2019_Jan_12_Shift1.pdf", type: "MAIN", year: 2019, fileId: "1ztFrvm79HP9q6X0RDmEAN7IZ8rjkvn5u" },
  { name: "JEE_Main_2019_Jan_12_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1yeCoX6p5tezjgdYnW5XJV2yxeiqTxuk" },

  // ==================== JEE MAIN 2019 (April) ====================

  { name: "JEE_Main_2019_Apr_08_Shift1.pdf", type: "MAIN", year: 2019, fileId: "1uwziCtbb3jl_q4NICDh8Ro49szr2JiIu" },
  { name: "JEE_Main_2019_Apr_08_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1RAtBSA3YxaTgSTYefbg7TYsGXzc3lTAb" },
  { name: "JEE_Main_2019_Apr_09_Shift1.pdf", type: "MAIN", year: 2019, fileId: "11d3SmW9IadTohcwVOa6QI1QUrw2q_YBB" },
  { name: "JEE_Main_2019_Apr_09_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1KT7gxZVnYQ-WkAv9jKbJHG-TPF34rdPU" },
  { name: "JEE_Main_2019_Apr_10_Shift1.pdf", type: "MAIN", year: 2019, fileId: "1BG942OYpiPfd4BmVGI0sd4JwILk6c88j" },
  { name: "JEE_Main_2019_Apr_10_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1e2FSs7T-8tdt4Ei5yxaEqyAcpWykSRbx" },
  { name: "JEE_Main_2019_Apr_12_Shift1.pdf", type: "MAIN", year: 2019, fileId: "1egSm8Q4O3wQJ-UeyvSbj86dAOmnJXK1p" },
  { name: "JEE_Main_2019_Apr_12_Shift2.pdf", type: "MAIN", year: 2019, fileId: "1iOzFbg8GZDeDZ8ayTOY_JhVLQJ8ak2MV" },

  // ==================== JEE MAIN 2018 ====================

  { name: "JEE_Main_2018_Offline_SetA.pdf", type: "MAIN", year: 2018, fileId: "1uKNyB_ulyfpGO-NWEleKMCkr6OR3JAyo" },
  { name: "JEE_Main_2018_Offline_SetB.pdf", type: "MAIN", year: 2018, fileId: "1aJY9N6IHvJvJ3PcYCQ2CQl-URFzKcVWf" },
  { name: "JEE_Main_2018_Offline_SetC.pdf", type: "MAIN", year: 2018, fileId: "1JjjcmGTF42iPYz6t0BLYe-1mjZHoe2lv" },
  { name: "JEE_Main_2018_Offline_SetD.pdf", type: "MAIN", year: 2018, fileId: "1ZSrg0o5q0TfAoPgK6hBM5GQiVjJV15DT" },
  { name: "JEE_Main_2018_Online_Day1.pdf", type: "MAIN", year: 2018, fileId: "1oz2GpZH9SZk6P0nGRSkYrFw0PxW0Fas4" },
  { name: "JEE_Main_2018_Online_Day2.pdf", type: "MAIN", year: 2018, fileId: "1A3RiAiSrWTmiDMQr66Rdq-TL1cUVe4p6" },

  // ==================== JEE MAIN 2017 ====================

  { name: "JEE_Main_2017_Offline_SetA.pdf", type: "MAIN", year: 2017, fileId: "1WKiHNJt3XtZGBjmkPGHokD-TAKdacCMA" },
  { name: "JEE_Main_2017_Offline_SetB.pdf", type: "MAIN", year: 2017, fileId: "163Cyh3qBDfI-BXZTcq_t1f_RtGxC-_ym" },
  { name: "JEE_Main_2017_Offline_SetC.pdf", type: "MAIN", year: 2017, fileId: "1XAvCZ_-RjzZeoJyJlWcPUKcrrzB5WAqg" },
  { name: "JEE_Main_2017_Offline_SetD.pdf", type: "MAIN", year: 2017, fileId: "1leGudruAg69SCoLjMIULN_1I6Vgxg_tK" },

  // ==================== JEE MAIN 2016 ====================

  { name: "JEE_Main_2016_Offline_SetE.pdf", type: "MAIN", year: 2016, fileId: "1ah6a6UQkcMV6TgwUwInf1n4Gcx5V0_Tw" },
  { name: "JEE_Main_2016_Offline_SetF.pdf", type: "MAIN", year: 2016, fileId: "1Bn0N5NLjYbOFy-Nb8J5AYUde-B8wR6uD" },
  { name: "JEE_Main_2016_Offline_SetG.pdf", type: "MAIN", year: 2016, fileId: "1jlM4Jw9h2T0FywsnkypBCC4rLT4QG2F1" },
  { name: "JEE_Main_2016_Offline_SetH.pdf", type: "MAIN", year: 2016, fileId: "1EmFo10jpbt-JK4QMfbnsIT6Ww-t4VwKo" },
  { name: "JEE_Main_2016_Online_Day1.pdf", type: "MAIN", year: 2016, fileId: "14jWJ8ks68qHpzeR-F0BLzGQOAtkPYcIP" },
  { name: "JEE_Main_2016_Online_Day2.pdf", type: "MAIN", year: 2016, fileId: "1GSNYC7JShLVPQWudDqJXrdKSMKFa_mqu" },

  // ==================== JEE MAIN 2015 ====================

  { name: "JEE_Main_2015_Offline_SetA.pdf", type: "MAIN", year: 2015, fileId: "1GPT6RwgtQP7eFZz2T-cAmHDwZXAkF2M8" },
  { name: "JEE_Main_2015_Offline_SetB.pdf", type: "MAIN", year: 2015, fileId: "1xii-ZpIMf76gsgdYnW5XJV2yxeiqTxuk" },
  { name: "JEE_Main_2015_Offline_SetC.pdf", type: "MAIN", year: 2015, fileId: "10pB6An5e1oRkyOUulBlo_n5kOMQ2GGfD" },
  { name: "JEE_Main_2015_Offline_SetD.pdf", type: "MAIN", year: 2015, fileId: "1LM3XphOvpo5ZaIdo1x0BxkRnf1jObWgs" },
  { name: "JEE_Main_2015_Online_Day1.pdf", type: "MAIN", year: 2015, fileId: "1KVLZTOZxB-tuPw658mplynr5jt6IrFsc" },
  { name: "JEE_Main_2015_Online_Day2.pdf", type: "MAIN", year: 2015, fileId: "1LVpGgkB7HSSS9WBpg7kvCpt8iqqKGPhC" },
];

async function downloadFromGDrive(fileId: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const download = (url: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        console.log("    Too many redirects");
        resolve(false);
        return;
      }

      https.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        }
      }, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 303) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            download(redirectUrl, redirectCount + 1);
            return;
          }
        }

        // Check for Google Drive virus scan warning page
        if (response.headers["content-type"]?.includes("text/html")) {
          let html = "";
          response.on("data", (chunk) => html += chunk);
          response.on("end", () => {
            // Extract confirm link for large files
            const confirmMatch = html.match(/confirm=([^&"]+)/);
            if (confirmMatch) {
              const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
              download(confirmUrl, redirectCount + 1);
            } else {
              console.log("    Could not bypass download page");
              resolve(false);
            }
          });
          return;
        }

        if (response.statusCode !== 200) {
          console.log(`    HTTP ${response.statusCode}`);
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
      }).on("error", (err) => {
        console.log(`    Request error: ${err.message}`);
        resolve(false);
      });
    };

    download(downloadUrl);
  });
}

async function main() {
  console.log("\n=== JEE Paper Downloader (Google Drive) ===\n");

  const advancedCount = papers.filter(p => p.type === "ADVANCED").length;
  const mainCount = papers.filter(p => p.type === "MAIN").length;

  console.log(`Total papers configured: ${papers.length}`);
  console.log(`  - JEE Advanced: ${advancedCount}`);
  console.log(`  - JEE Main: ${mainCount}`);
  console.log(`Output directory: ${EXAM_PAPERS_DIR}\n`);

  // Check which papers already exist
  const existingFiles = fs.readdirSync(EXAM_PAPERS_DIR);
  const toDownload = papers.filter(p => !existingFiles.includes(p.name));

  const advToDownload = toDownload.filter(p => p.type === "ADVANCED").length;
  const mainToDownload = toDownload.filter(p => p.type === "MAIN").length;

  console.log(`Already downloaded: ${papers.length - toDownload.length}`);
  console.log(`Need to download: ${toDownload.length}`);
  console.log(`  - JEE Advanced: ${advToDownload}`);
  console.log(`  - JEE Main: ${mainToDownload}\n`);

  if (toDownload.length === 0) {
    console.log("All papers already downloaded!");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const paper of toDownload) {
    const filepath = path.join(EXAM_PAPERS_DIR, paper.name);

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
        console.log(`  Failed (file too small - likely error page)`);
        failed++;
      }
    } else {
      failed++;
      console.log(`  Failed!`);
    }

    // Delay between downloads to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n=== Summary ===`);
  console.log(`Downloaded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total PDFs in folder: ${fs.readdirSync(EXAM_PAPERS_DIR).filter(f => f.endsWith(".pdf")).length}`);
}

main().catch(console.error);
