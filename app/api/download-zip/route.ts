import { NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"

export const runtime = "nodejs"

type IncomingImage = {
  url?: string
  filename?: string
}

const FALLBACK_NAME = "selected-print"

function sanitizeFilename(name: string, index: number) {
  const trimmed = name.trim() || `${FALLBACK_NAME}-${index + 1}`
  const normalized = trimmed.replace(/[^a-zA-Z0-9-_\.]+/g, "_")
  if (normalized.includes(".")) {
    return normalized
  }
  return `${normalized}.jpg`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const images: IncomingImage[] | null = Array.isArray(body?.images) ? body.images : null

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images supplied" }, { status: 400 })
    }

    const zip = new JSZip()
    const failures: string[] = []
    let successCount = 0

    await Promise.all(
      images.map(async (item, index) => {
        const url = typeof item?.url === "string" ? item.url : ""
        if (!url) {
          failures.push(`missing-url-${index + 1}`)
          return
        }

        const filename = sanitizeFilename(item?.filename ?? FALLBACK_NAME, index)

        try {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          const arrayBuffer = await response.arrayBuffer()
          zip.file(filename, arrayBuffer)
          successCount += 1
        } catch (error) {
          console.error("Failed to fetch", { url, error })
          failures.push(filename)
        }
      })
    )

    if (successCount === 0) {
      return NextResponse.json({ error: "Unable to download any of the requested images", details: failures }, { status: 502 })
    }

    const zipData = await zip.generateAsync({ type: "uint8array" })
    const arrayBuffer = zipData.buffer.slice(zipData.byteOffset, zipData.byteOffset + zipData.byteLength)

    const response = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="sneha-selected-prints.zip"`,
        "Content-Length": zipData.byteLength.toString()
      }
    })

    if (failures.length > 0) {
      response.headers.set("X-Download-Errors", failures.join(","))
    }

    return response
  } catch (error) {
    console.error("Download zip route error", error)
    return NextResponse.json(
      {
        error: "Failed to generate download",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
