import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button, Card, TimelineEntry } from "../../components/ui"
import { formatTimestamp } from "../../utils/youtubeUtils"
import VideoSummary from "../../components/VideoSummary"

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player/youtube"), { ssr: false })

type SubtitleEntry = {
  start: number
  end: number
  text: string
}

type ResultsPageProps = {
  initialData?: {
    videoId: string
    title: string
    entries: SubtitleEntry[]
  }
  error?: string
}

export default function ResultsPage({ initialData, error: serverError }: ResultsPageProps) {
  const router = useRouter()
  const { videoId } = router.query

  const [videoData, setVideoData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState(serverError || "")
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeEntryIndex, setActiveEntryIndex] = useState(-1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEntries, setFilteredEntries] = useState<SubtitleEntry[]>([])

  // Fetch subtitle data if not provided initially
  useEffect(() => {
    const fetchSubtitleData = async () => {
      if (!videoId || initialData) return

      setIsLoading(true)
      setError("")

      try {
        // Fetch subtitle data from our API
        const response = await fetch(`/api/subtitles/${videoId}/vtt?lang=en`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch subtitle data")
        }

        setVideoData({
          videoId: data.videoId,
          title: "YouTube Video", // In a real app, you'd fetch the title separately
          entries: data.entries || [],
        })

        setFilteredEntries(data.entries || [])
      } catch (error: unknown) {
        console.error("Error fetching subtitle data:", error)
        setError(typeof error === "object" && error !== null && "message" in error
          ? (error as Error).message
          : "An error occurred while fetching subtitle data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubtitleData()
  }, [videoId, initialData])

  // Filter entries when search term changes
  useEffect(() => {
    if (!videoData?.entries) return

    if (!searchTerm.trim()) {
      setFilteredEntries(videoData.entries)
      return
    }

    const termLower = searchTerm.toLowerCase()
    const filtered = videoData.entries.filter((entry) => entry.text.toLowerCase().includes(termLower))

    setFilteredEntries(filtered)
  }, [searchTerm, videoData])

  // Update active entry based on current video time
  useEffect(() => {
    if (!videoData?.entries || videoData.entries.length === 0) return

    const index = videoData.entries.findIndex((entry) => currentTime >= entry.start && currentTime <= entry.end)

    if (index !== -1 && index !== activeEntryIndex) {
      setActiveEntryIndex(index)
    }
  }, [currentTime, videoData, activeEntryIndex])

  // Handle clicking on a subtitle entry
  const handleEntryClick = (entry: SubtitleEntry, index: number) => {
    setActiveEntryIndex(index)
    setIsPlaying(true)

    // If using an actual player component, you would seek to this time
    if (entry.start) {
      // In a real implementation, you would seek the player to this time
      setCurrentTime(entry.start)
    }
  }

  // Handle video progress
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds)
  }

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Download subtitles as text file
  const downloadSubtitlesAsTxt = () => {
    if (!videoData?.entries || videoData.entries.length === 0) return
    
    // Format subtitle entries as text
    const subtitleText = videoData.entries.map(entry => {
      return `[${formatTimestamp(entry.start)}] ${entry.text}`
    }).join('\n\n')
    
    // Create a download link
    const element = document.createElement('a')
    const file = new Blob([subtitleText], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `${videoData.title || `youtube-subtitles-${videoId}`}.txt`
    
    // Append to the document, click, and clean up
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mb-4"></div>
          <p>Loading subtitle data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="mb-6">{error}</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{videoData?.title || "Video Timeline"} | YouTube Subtitle Timeline</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{videoData?.title || "Video Timeline"}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Column */}
          <div className="lg:col-span-2">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              {videoId && (
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${videoId}`}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  controls={true}
                  onProgress={handleProgress}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  progressInterval={100}
                />
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Current Time: {formatTimestamp(currentTime)}</h2>
                <Button variant="secondary" size="small" onClick={handlePlayPause}>
                  {isPlaying ? "Pause" : "Play"}
                </Button>
              </div>

              {videoData?.entries && activeEntryIndex >= 0 && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-lg">
                    &quot;{videoData.entries[activeEntryIndex]?.text}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subtitles Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search subtitles..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-[500px] overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "No matching subtitles found" : "No subtitles available for this video"}
                </div>
              ) : (
                filteredEntries.map((entry, index) => (
                  <TimelineEntry
                    key={`${entry.start}-${index}`}
                    timestamp={formatTimestamp(entry.start)}
                    text={entry.text}
                    isActive={index === activeEntryIndex}
                    onClick={() => handleEntryClick(entry, index)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex space-x-4">
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
            <Button 
              variant="secondary"
              disabled={!videoData?.entries || videoData.entries.length === 0} 
              onClick={downloadSubtitlesAsTxt}
            >
              Download Subtitles as TXT
            </Button>
          </div>
        </div>
        {/* Add Video Summary */}
        {videoId && typeof videoId === "string" && (
          <div className="mb-8">
            <VideoSummary
              videoId={videoId}
              hasSubtitles={!!videoData?.entries?.length}
              onAddToTimeline={(summary) => {
                // Add the summary to the timeline
                const newEntry: SubtitleEntry = {
                  start: 0,
                  end: 0,
                  text: summary,
                }
                setVideoData((prev) =>
                  prev
                    ? {
                        ...prev,
                        entries: [newEntry, ...prev.entries],
                      }
                    : undefined
                )
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

// In a real application, you would fetch initial data on the server
export async function getServerSideProps() {
  // For the example, we'll skip server-side data fetching
  // In a real app, you would fetch the data here
  
  return {
    props: {
      // Leave initialData undefined so it will be fetched client-side
      // This simulates the common pattern of loading data client-side
    }
  };
}
