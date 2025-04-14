import { TimelineMarker } from '../types/timeline';

/**
 * TimeSync utility for managing the synchronization between 
 * video playback and timeline markers
 */
export class TimeSync {
  private markers: TimelineMarker[];
  private currentMarkerIndex: number = -1;

  constructor(markers: TimelineMarker[] = []) {
    this.markers = markers;
  }

  /**
   * Update the markers used for synchronization
   */
  setMarkers(markers: TimelineMarker[]): void {
    this.markers = markers;
    this.currentMarkerIndex = -1;
  }

  /**
   * Get the current timeline markers
   */
  getMarkers(): TimelineMarker[] {
    return this.markers;
  }

  /**
   * Get the number of markers in the timeline
   */
  getMarkersCount(): number {
    return this.markers.length;
  }

  /**
   * Get a specific marker by index
   */
  getMarker(index: number): TimelineMarker | null {
    if (index < 0 || index >= this.markers.length) {
      return null;
    }
    return this.markers[index];
  }

  /**
   * Find the index of the marker active at the given time
   */
  findMarkerIndexAtTime(currentTime: number): number {
    if (!this.markers || !this.markers.length) return -1;
    
    // Check if we're already in the right marker to avoid unnecessary iteration
    if (this.currentMarkerIndex >= 0 && this.currentMarkerIndex < this.markers.length) {
      const current = this.markers[this.currentMarkerIndex];
      const next = this.currentMarkerIndex < this.markers.length - 1 
        ? this.markers[this.currentMarkerIndex + 1] 
        : null;
      
      if (currentTime >= current.time && (!next || currentTime < next.time)) {
        return this.currentMarkerIndex;
      }
    }
    
    // Otherwise, find the correct marker
    for (let i = 0; i < this.markers.length; i++) {
      const marker = this.markers[i];
      const nextMarker = i < this.markers.length - 1 ? this.markers[i + 1] : null;
      
      if (currentTime >= marker.time && (!nextMarker || currentTime < nextMarker.time)) {
        this.currentMarkerIndex = i;
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Get the marker active at the given time
   */
  findMarkerAtTime(currentTime: number): TimelineMarker | null {
    const index = this.findMarkerIndexAtTime(currentTime);
    return index !== -1 ? this.markers[index] : null;
  }

  /**
   * Find the nearest marker to the given time
   */
  findNearestMarker(currentTime: number): TimelineMarker | null {
    if (!this.markers || !this.markers.length) return null;

    // First try to find the marker we're currently in
    const currentMarker = this.findMarkerAtTime(currentTime);
    if (currentMarker) return currentMarker;
    
    // If we're before the first marker, return the first one
    if (currentTime < this.markers[0].time) return this.markers[0];
    
    // If we're after the last marker, return the last one
    if (currentTime > this.markers[this.markers.length - 1].time) {
      return this.markers[this.markers.length - 1];
    }
    
    // Otherwise, find the closest upcoming marker
    let closestUpcoming: TimelineMarker | null = null;
    let minDistance = Number.MAX_VALUE;
    
    for (const marker of this.markers) {
      if (marker.time > currentTime) {
        const distance = marker.time - currentTime;
        if (distance < minDistance) {
          minDistance = distance;
          closestUpcoming = marker;
        }
      }
    }
    
    return closestUpcoming;
  }

  /**
   * Get the previous marker from the current time
   */
  getPreviousMarker(currentTime: number): TimelineMarker | null {
    const currentIndex = this.findMarkerIndexAtTime(currentTime);
    
    if (currentIndex > 0) {
      return this.markers[currentIndex - 1];
    } else if (currentIndex === -1 && this.markers.length > 0) {
      // If we're before all markers, return null
      // If we're after all markers, return the last one
      if (currentTime < this.markers[0].time) {
        return null;
      } else {
        return this.markers[this.markers.length - 1];
      }
    }
    
    return null;
  }

  /**
   * Get the next marker from the current time
   */
  getNextMarker(currentTime: number): TimelineMarker | null {
    const currentIndex = this.findMarkerIndexAtTime(currentTime);
    
    if (currentIndex !== -1 && currentIndex < this.markers.length - 1) {
      return this.markers[currentIndex + 1];
    } else if (currentIndex === -1) {
      // Find the first marker after the current time
      for (const marker of this.markers) {
        if (marker.time > currentTime) {
          return marker;
        }
      }
    }
    
    return null;
  }
}

// Create a singleton instance for app-wide use
export const timeSync = new TimeSync();

export default timeSync; 