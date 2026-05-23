/* eslint-disable formatjs/no-literal-string-in-jsx */
import { Box, Button, Rows, Text } from "@canva/app-ui-kit";
import { addElementAtPoint } from "@canva/design";
import { useFeatureSupport, useSelection } from "@canva/app-hooks";
import { getTemporaryUrl } from "@canva/asset";
import { useState } from "react";
import { contours } from "d3-contour";

export const App = () => {
  const isSupported = useFeatureSupport();
  const canAddElement = isSupported(addElementAtPoint);
  const [imageRefs, setImageRefs] = useState<string[]>([]);
  const selectedImage = useSelection("image");

  const handleReadImage = async () => {
    const draft = await selectedImage.read();
    if (!draft.contents || draft.contents.length === 0) return;

    const firstContent = draft.contents[0];
    setImageRefs(draft.contents.map((item) => item.ref));

    if (canAddElement && firstContent) {
      const { url } = await getTemporaryUrl({
        type: "image",
        ref: firstContent.ref,
      });

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;

      img.onload = async () => {
        // Batasi ukuran maksimal canvas agar kerapatan awal proporsional
        const MAX_SIZE = 250;
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / targetWidth, MAX_SIZE / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const totalPixels = canvas.width * canvas.height;
        const alphaValues = new Array(totalPixels);
        for (let i = 0, j = 3; i < totalPixels; i++, j += 4) {
          alphaValues[i] = imageData.data[j];
        }

        const contourList = contours()
          .size([canvas.width, canvas.height])
          .thresholds([128])(alphaValues);

        const firstContour = contourList?.[0];
        if (firstContour && firstContour.coordinates.length > 0) {
          let pathString = "";

          const mainPolygon = firstContour.coordinates[0];

          if (mainPolygon && mainPolygon.length > 0) {
            const mainRing = mainPolygon[0];

            if (mainRing && mainRing.length >= 3) {
              const basePoints: [number, number][] = [];
              let lastX = -1;
              let lastY = -1;

              // Tahap 1: Gunakan kompresi jarak lebih longgar (5.0) 
              // Ini krusial memberikan ruang byte untuk karakter koma desimal
              mainRing.forEach((point, index) => {
                const px = point?.[0];
                const py = point?.[1];
                if (typeof px !== "number" || typeof py !== "number") return;

                // Membaca kordinat dengan akurasi 1 angka di belakang koma desimal
                const x = Math.round(px * 10) / 10;
                const y = Math.round(py * 10) / 10;

                if (index > 0 && index < mainRing.length - 1) {
                  const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
                  if (distance < 5.0) return;
                }

                basePoints.push([x, y]);
                lastX = x;
                lastY = y;
              });

              // Tahap 2: Algoritma Subdivision untuk Menghaluskan Pola Garis
              if (basePoints.length >= 3) {
                const smoothPoints: [number, number][] = [];

                for (let i = 0; i < basePoints.length; i++) {
                  const current = basePoints[i];
                  const next = basePoints[(i + 1) % basePoints.length];

                  if (current && next) {
                    // Pecah sudut tajam menjadi 2 segmen baru dengan kalkulasi 1 desimal (koma)
                    const p1X = Math.round((0.75 * current[0] + 0.25 * next[0]) * 10) / 10;
                    const p1Y = Math.round((0.75 * current[1] + 0.25 * next[1]) * 10) / 10;

                    const p2X = Math.round((0.25 * current[0] + 0.75 * next[0]) * 10) / 10;
                    const p2Y = Math.round((0.25 * current[1] + 0.75 * next[1]) * 10) / 10;

                    smoothPoints.push([p1X, p1Y]);
                    smoothPoints.push([p2X, p2Y]);
                  }
                }

                // Tahap 3: Merangkai teks SVG koordinat menggunakan koma desimal
                if (smoothPoints.length > 0 && smoothPoints[0]) {
                  let ringPath = `M ${smoothPoints[0][0]},${smoothPoints[0][1]} `;

                  for (let i = 1; i < smoothPoints.length; i++) {
                    const pt = smoothPoints[i];
                    if (pt) {
                      ringPath += `L ${pt[0]},${pt[1]} `;
                    }
                  }

                  pathString = ringPath.trim() + " Z";
                }
              }
            }
          }

          if (pathString) {
            // Log monitor kapasitas string byte untuk memastikan kepatuhan 16KB Canva
            const byteSize = new Blob([pathString]).size;
            console.debug(`Ukuran Path Desimal Halus: ${byteSize} bytes (Limit Canva: 16384).`);

            const visualWidth = 200;
            const visualHeight = (targetHeight / targetWidth) * visualWidth;

            // Memasukkan bangun datar ke kanvas Canva
            await addElementAtPoint({
              type: "shape",
              paths: [
                {
                  d: pathString,
                  fill: {
                    color: "#ff4d4d",
                    dropTarget: true,
                  },
                },
              ],
              viewBox: {
                width: targetWidth,
                height: targetHeight,
                left: 0,
                top: 0,
              },
              top: 0,
              left: 0,
              width: visualWidth,
              height: visualHeight,
            });
          } else {
            console.warn("Gagal membuat path luar yang valid.");
          }
        }
      };
    }
  };

  const handleAddHeart = async () => {
    if (canAddElement === false) return;

    await addElementAtPoint({
      type: "shape",
      paths: [
        {
          d: "M 50,92.5 C 50,92.5 15,62.5 15,32.5 C 15,17.5 27.5,5 42.5,5 C 50,5 50,15 50,15 C 50,15 50,5 57.5,5 C 72.5,5 85,17.5 85,32.5 C 85,62.5 50,92.5 50,92.5 Z",
          fill: {
            color: "#ff4d4d",
            dropTarget: true,
          },
        },
      ],
      viewBox: {
        width: 100,
        height: 100,
        left: 0,
        top: 0,
      },
      top: 0,
      left: 0,
      width: 200,
      height: 200,
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <Rows spacing="2u">
        <Text>ADD HEART SHAPE</Text>
        <Button variant="primary" onClick={handleAddHeart} disabled={!canAddElement} stretch>
          Klik Hati
        </Button>
        <Button variant="primary" onClick={handleReadImage} disabled={!canAddElement} stretch>
          Jiplak Gambar (Trace)
        </Button>
        <Box>
          <Text size="small">Asset Refs:</Text>
          {imageRefs.length > 0 ? (
            imageRefs.map((ref, index) => (
              <Text key={index} size="xsmall">{ref}</Text>
            ))
          ) : (
            <Text size="xsmall" tone="tertiary">Belum ada gambar yang diseleksi</Text>
          )}
        </Box>
      </Rows>
    </div>
  );
};