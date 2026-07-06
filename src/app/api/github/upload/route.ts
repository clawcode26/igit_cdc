import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as Blob
    const filename = formData.get('filename') as string

    if (!file || !filename) {
      return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 })
    }

    const PAT = process.env.GITHUB_PAT
    const OWNER = process.env.GITHUB_OWNER
    const REPO = process.env.GITHUB_REPO

    if (!PAT || !OWNER || !REPO) {
      return NextResponse.json({ error: 'GitHub credentials not configured on server' }, { status: 500 })
    }

    // 1. Get or Create a Release called "Notices"
    let releaseId = null
    const releasesRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (releasesRes.ok) {
      const releases = await releasesRes.json()
      const noticeRelease = releases.find((r: any) => r.tag_name === 'notices')
      if (noticeRelease) {
        releaseId = noticeRelease.id
      }
    }

    // If "notices" release doesn't exist, create it
    if (!releaseId) {
      const createRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag_name: 'notices',
          name: 'Notices Storage',
          body: 'Auto-generated release for storing notice PDFs.',
          draft: false,
          prerelease: false
        })
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        return NextResponse.json({ error: 'Failed to create GitHub release', details: createData }, { status: 500 })
      }
      releaseId = createData.id
    }

    // 2. Upload Asset to the Release
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Ensure unique filename
    const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const uploadRes = await fetch(`https://uploads.github.com/repos/${OWNER}/${REPO}/releases/${releaseId}/assets?name=${uniqueFilename}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/pdf'
      },
      body: buffer
    })

    const uploadData = await uploadRes.json()

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Failed to upload asset', details: uploadData }, { status: 500 })
    }

    // GitHub returns url for API access, and browser_download_url
    // For a private repo, browser_download_url redirects to a secure AWS S3 link, but the API URL requires auth.
    // The FreeFlow Desktop app will use the api URL with the PAT.
    return NextResponse.json({ 
      success: true, 
      url: uploadData.url,
      filename: uniqueFilename
    })

  } catch (error: any) {
    console.error('GitHub Upload API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
