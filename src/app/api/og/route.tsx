import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import sharp from "sharp";

// Use Node.js runtime for sharp support
export const runtime = "nodejs";

const FREEIMAGE_API_KEY = "6d207e02198a847aa98d0a2a901485a5";

// Font URLs (Bold weight) - Direct TTF URLs from Google Fonts
const FONT_URLS: Record<string, { url: string; name: string }> = {
  "noto-sans-thai": {
    url: "https://fonts.gstatic.com/s/notosansthai/v25/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU5RtpzF-QRvzzXg.ttf",
    name: "Noto Sans Thai",
  },
  "sarabun": {
    url: "https://fonts.gstatic.com/s/sarabun/v17/DtVmJx26TKEr37c9YK5sulw.ttf",
    name: "Sarabun",
  },
  "prompt": {
    url: "https://fonts.gstatic.com/s/prompt/v12/-W_8XJnvUD7dzB2C2_84bg.ttf",
    name: "Prompt",
  },
  "kanit": {
    url: "https://fonts.gstatic.com/s/kanit/v17/nKKU-Go6G5tXcr4uPiWg.ttf",
    name: "Kanit",
  },
  "mitr": {
    url: "https://fonts.gstatic.com/s/mitr/v13/pxiEypw5ucZF8YcdFJA.ttf",
    name: "Mitr",
  },
  "chakra-petch": {
    url: "https://fonts.gstatic.com/s/chakrapetch/v13/cIflMapbsEk7TDLdtEz1BwkeJI9FQA.ttf",
    name: "Chakra Petch",
  },
};

// Load Thai font by ID
async function loadThaiFont(fontId: string) {
  const fontConfig = FONT_URLS[fontId] || FONT_URLS["noto-sans-thai"];
  const response = await fetch(fontConfig.url);
  return {
    data: await response.arrayBuffer(),
    name: fontConfig.name,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get params
    const text = searchParams.get("text") || "Default Text";
    const imageUrl = searchParams.get("image") || "";
    const fontId = searchParams.get("font") || "noto-sans-thai";
    const outputFormat = searchParams.get("output") || "image"; // image or json

    // Load font
    const thaiFont = await loadThaiFont(fontId);

    // Auto-scale font size based on text length
    const textLength = text.length;
    let fontSize = 72;
    if (textLength > 200) fontSize = 36;
    else if (textLength > 150) fontSize = 42;
    else if (textLength > 100) fontSize = 48;
    else if (textLength > 60) fontSize = 56;
    else if (textLength > 30) fontSize = 64;

    // Create the image response
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            fontFamily: thaiFont.name,
            background: imageUrl
              ? "#1a1a2e"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Background Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}

          {/* Overlay */}
          {imageUrl && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
              }}
            />
          )}

          {/* Text Container - Full size centered */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <div
              lang="th"
              style={{
                fontSize: fontSize,
                fontWeight: 700,
                color: "white",
                textAlign: "center",
                lineHeight: 1.4,
                letterSpacing: "0.05em",
                textShadow: "0 4px 12px rgba(0,0,0,0.6)",
                maxWidth: "720px",
              }}
            >
              {text}
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 1200,
        fonts: [
          {
            name: thaiFont.name,
            data: thaiFont.data,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );

    // Get PNG buffer from ImageResponse
    const pngBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Convert to WEBP
    const outputBuffer = await sharp(pngBuffer)
      .webp({ quality: 90, effort: 4 })
      .toBuffer();

    // If output=json, upload to freeimage.host and return JSON
    if (outputFormat === "json") {
      const base64 = outputBuffer.toString("base64");

      // Upload to freeimage.host
      const formData = new FormData();
      formData.append("key", FREEIMAGE_API_KEY);
      formData.append("action", "upload");
      formData.append("source", base64);
      formData.append("format", "json");

      const uploadRes = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        body: formData,
      });

      const json = await uploadRes.json();

      return new Response(JSON.stringify(json, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Default: return image
    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate image", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
