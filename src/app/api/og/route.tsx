import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import sharp from "sharp";

// Use Node.js runtime for sharp support
export const runtime = "nodejs";

const FREEIMAGE_API_KEY = "6d207e02198a847aa98d0a2a901485a5";

// Font URLs (Bold weight) - Direct TTF URLs from Google Fonts
const FONT_URLS: Record<string, { url: string; name: string }> = {
  // Popular Thai Fonts
  "noto-sans-thai": {
    url: "https://fonts.gstatic.com/s/notosansthai/v29/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU3NqpzE.ttf",
    name: "Noto Sans Thai",
  },
  "noto-serif-thai": {
    url: "https://fonts.gstatic.com/s/notoserifthai/v28/k3kyo80MPvpLmixYH7euCxWpSMu3-gcWGj0hHAKGvUQlUv_bCKDUSzB5L0rFEORR.ttf",
    name: "Noto Serif Thai",
  },
  "noto-sans-thai-looped": {
    url: "https://fonts.gstatic.com/s/notosansthailooped/v16/B503F6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R36MIjwurFMX_p0KVmQL3HnxYJ8hCVQ-_jKGRJi.ttf",
    name: "Noto Sans Thai Looped",
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
  // More Thai Fonts
  "anuphan": {
    url: "https://fonts.gstatic.com/s/anuphan/v6/2sDBZGxYgY7LkLT0s2Yrm5UhuLoIZCn_8g4k.ttf",
    name: "Anuphan",
  },
  "athiti": {
    url: "https://fonts.gstatic.com/s/athiti/v14/pe0sMISdLIZIv1wAsDdyAg.ttf",
    name: "Athiti",
  },
  "bai-jamjuree": {
    url: "https://fonts.gstatic.com/s/baijamjuree/v13/LDIqapSCOBt_aeQQ7ftydoa05efukw.ttf",
    name: "Bai Jamjuree",
  },
  "charm": {
    url: "https://fonts.gstatic.com/s/charm/v14/7cHrv4oii5K0Md6TDss8.ttf",
    name: "Charm",
  },
  "charmonman": {
    url: "https://fonts.gstatic.com/s/charmonman/v20/MjQAmiR3vP_nuxDv47jiYC2HmL8.ttf",
    name: "Charmonman",
  },
  "fahkwang": {
    url: "https://fonts.gstatic.com/s/fahkwang/v18/Noa26Uj3zpmBOgbNpOIznZlR.ttf",
    name: "Fahkwang",
  },
  "ibm-plex-sans-thai": {
    url: "https://fonts.gstatic.com/s/ibmplexsansthai/v11/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEsvMFbQ.ttf",
    name: "IBM Plex Sans Thai",
  },
  "ibm-plex-sans-thai-looped": {
    url: "https://fonts.gstatic.com/s/ibmplexsansthailooped/v12/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_K6vhFk.ttf",
    name: "IBM Plex Sans Thai Looped",
  },
  "k2d": {
    url: "https://fonts.gstatic.com/s/k2d/v13/J7aenpF2V0Ery4AJlA.ttf",
    name: "K2D",
  },
  "kodchasan": {
    url: "https://fonts.gstatic.com/s/kodchasan/v20/1cX0aUPOAJv9sG4I-DJeM1SggQ.ttf",
    name: "Kodchasan",
  },
  "krub": {
    url: "https://fonts.gstatic.com/s/krub/v11/sZlEdRyC6CRYZvo_KLE.ttf",
    name: "Krub",
  },
  "kulim-park": {
    url: "https://fonts.gstatic.com/s/kulimpark/v15/fdN49secq3hflz1Uu3IwjOIJwa4.ttf",
    name: "Kulim Park",
  },
  "mali": {
    url: "https://fonts.gstatic.com/s/mali/v13/N0bV2SRONuN4QJbhKlQ.ttf",
    name: "Mali",
  },
  "maitree": {
    url: "https://fonts.gstatic.com/s/maitree/v11/MjQDmil5tffhpBrklmWJWJE.ttf",
    name: "Maitree",
  },
  "niramit": {
    url: "https://fonts.gstatic.com/s/niramit/v12/I_urMpWdvgLdNxVLVQh_tig.ttf",
    name: "Niramit",
  },
  "pridi": {
    url: "https://fonts.gstatic.com/s/pridi/v15/2sDdZG5JnZLfkc0mjE0j.ttf",
    name: "Pridi",
  },
  "srisakdi": {
    url: "https://fonts.gstatic.com/s/srisakdi/v18/yMJWMIlvdpDbkB0A-gIAUghx.ttf",
    name: "Srisakdi",
  },
  "taviraj": {
    url: "https://fonts.gstatic.com/s/taviraj/v15/ahccv8Cj3ylylTXzRFIOd-k.ttf",
    name: "Taviraj",
  },
  "thasadith": {
    url: "https://fonts.gstatic.com/s/thasadith/v13/mtG94_1TIqPYrd_f5R1gDGYw2A.ttf",
    name: "Thasadith",
  },
  "trirong": {
    url: "https://fonts.gstatic.com/s/trirong/v17/7r3DqXNgp8wxdOdOlzAN_a4.ttf",
    name: "Trirong",
  },
  // Additional Thai Fonts
  "chonburi": {
    url: "https://fonts.gstatic.com/s/chonburi/v14/8AtqGs-wOpGRTBq66IWa.ttf",
    name: "Chonburi",
  },
  "itim": {
    url: "https://fonts.gstatic.com/s/itim/v16/0nknC9ziJOYewAQ.ttf",
    name: "Itim",
  },
  "koho": {
    url: "https://fonts.gstatic.com/s/koho/v18/K2FxfZ5fmddNPpUxWJ4.ttf",
    name: "KoHo",
  },
  "pattaya": {
    url: "https://fonts.gstatic.com/s/pattaya/v18/ea8ZadcqV_zkHY-XNdA.ttf",
    name: "Pattaya",
  },
  "playpen-sans-thai": {
    url: "https://fonts.gstatic.com/s/playpensansthai/v8/VdG3AYIdG5kSgHwmKT9wYu2rs0cBsu-N7E_aclWp2hxLZRePow.ttf",
    name: "Playpen Sans Thai",
  },
  "sriracha": {
    url: "https://fonts.gstatic.com/s/sriracha/v16/0nkrC9D4IuYBgWcI9ObY.ttf",
    name: "Sriracha",
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
