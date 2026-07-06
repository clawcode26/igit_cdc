import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const apiUrl = searchParams.get('url')

    if (!apiUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    const PAT = process.env.GITHUB_PAT

    if (!PAT) {
      return NextResponse.json({ error: 'GitHub credentials not configured on server' }, { status: 500 })
    }

    // Fetch the asset from GitHub using the API URL and PAT
    // To download the binary content of the asset, we must pass the "Accept: application/octet-stream" header
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Accept': 'application/octet-stream',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('GitHub API error:', errorData)
      return NextResponse.json({ error: 'Failed to fetch PDF from GitHub storage' }, { status: response.status })
    }

    // Return the PDF buffer to the client
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Notice.pdf"'
      }
    })

  } catch (error: any) {
    console.error('GitHub Download Proxy Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
