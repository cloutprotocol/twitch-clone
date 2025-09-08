/**
 * Server-side thumbnail extraction from video files
 * Uses FFmpeg to extract frames from recorded segments
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export interface ExtractOptions {
  inputPath: string;
  outputPath: string;
  timestamp?: string; // e.g., "00:00:01" for 1 second
  width?: number;
  height?: number;
  quality?: number; // 1-31, lower is better
}

/**
 * Extract thumbnail from video file using FFmpeg
 */
export const extractThumbnailFromVideo = async (options: ExtractOptions): Promise<string> => {
  const {
    inputPath,
    outputPath,
    timestamp = "00:00:01",
    width = 1280,
    height = 720,
    quality = 2
  } = options;

  // Check if input file exists
  if (!existsSync(inputPath)) {
    throw new Error(`Input video file not found: ${inputPath}`);
  }

  try {
    // FFmpeg command to extract thumbnail
    const command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-ss', timestamp,
      '-vframes', '1',
      '-vf', `scale=${width}:${height}`,
      '-q:v', quality.toString(),
      '-y', // Overwrite output file
      `"${outputPath}"`
    ].join(' ');

    console.log(`Extracting thumbnail: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('frame=')) {
      console.warn('FFmpeg stderr:', stderr);
    }

    // Check if output file was created
    if (!existsSync(outputPath)) {
      throw new Error('Thumbnail extraction failed - output file not created');
    }

    console.log(`Thumbnail extracted successfully: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    console.error('FFmpeg extraction failed:', error);
    throw new Error(`Thumbnail extraction failed: ${error}`);
  }
};

/**
 * Extract multiple thumbnails at different timestamps
 */
export const extractMultipleThumbnails = async (
  inputPath: string,
  outputDir: string,
  timestamps: string[] = ["00:00:01", "00:00:30", "00:01:00"]
): Promise<string[]> => {
  const results: string[] = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    const outputPath = `${outputDir}/thumb-${i + 1}.jpg`;
    
    try {
      await extractThumbnailFromVideo({
        inputPath,
        outputPath,
        timestamp
      });
      results.push(outputPath);
    } catch (error) {
      console.error(`Failed to extract thumbnail at ${timestamp}:`, error);
    }
  }
  
  return results;
};

/**
 * Check if FFmpeg is available
 */
export const checkFFmpegAvailable = async (): Promise<boolean> => {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('FFmpeg not available:', error);
    return false;
  }
};

/**
 * Get video duration using FFprobe
 */
export const getVideoDuration = async (inputPath: string): Promise<number> => {
  try {
    const command = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`;
    const { stdout } = await execAsync(command);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('Failed to get video duration:', error);
    throw error;
  }
};