import type { NextApiRequest, NextApiResponse } from "next"
import { GoogleGenerativeAI } from "@google/generative-ai"

type SummaryRequest = {
  videoId: string
  language?: string
  length?: "short" | "medium" | "long"
}

type SummaryResponse = {
  videoId: string
  summary: string
  characterCount?: number
  error?: string
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Define word limits for different summary lengths
const SUMMARY_LENGTHS = {
  short: 100,
  medium: 200,
  long: 400,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SummaryResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({
      videoId: "",
      summary: "",
      error: "Method not allowed",
    })
  }

  try {
    const { videoId, language = "en", length = "medium" } = req.body as SummaryRequest

    if (!videoId) {
      return res.status(400).json({
        videoId: "",
        summary: "",
        error: "Video ID is required",
      })
    }

    // First, fetch the subtitles
    const subtitleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subtitles/${videoId}/${language}`)

    if (!subtitleResponse.ok) {
      throw new Error("Failed to fetch subtitles")
    }

    const subtitleData = await subtitleResponse.json()

    if (!subtitleData.entries || subtitleData.entries.length === 0) {
      return res.status(404).json({
        videoId,
        summary: "",
        error: "No subtitles found for this video",
      })
    }

    // Combine all subtitle text into a single string
    const fullText = subtitleData.entries.map((entry: any) => entry.text).join(" ")

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Create a prompt for summarization based on the requested length
    const wordLimit = SUMMARY_LENGTHS[length]
    const prompt = `Your output should use the following template:

### Summary

### Analogy

### Notes

- [Emoji] Bulletpoint

### Keywords

- Explanation


You have been tasked with creating a concise summary of a YouTube video using its transcription to supply college student notes to use himself. You are to act like an expert in the subject the transcription is written about.


Make a summary of the transcript. Use keywords from the transcript. Don't explain them. Keywords will be explained later.


Additionally make a short complex analogy to give context and/or analogy from day-to-day life from the transcript.


Create 10 bullet points (each with an appropriate emoji) that summarize the key points or important moments from the video's transcription.


In addition to the bullet points, extract the most important keywords and any complex words not known to the average reader aswell as any acronyms mentioned. For each keyword and complex word, provide an explanation and definition based on its occurrence in the transcription.


You are also a transcription AI and you have been provided with a text that may contain mentions of sponsorships or brand names. Your task write what you have been said to do while avoiding any mention of sponsorships or brand names.


Please ensure that the summary, bullet points, and explanations fit within the 330-word limit, while still offering a comprehensive and clear understanding of the video's content. Use the text above: ${fullText}..`

    // Generate the summary
    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    // Calculate character count
    const characterCount = summary.length

    return res.status(200).json({
      videoId,
      summary,
      characterCount,
    })
  } catch (error: any) {
    console.error("Error generating summary:", error)
    return res.status(500).json({
      videoId: req.body.videoId || "",
      summary: "",
      error: error.message || "Failed to generate summary",
    })
  }
}
