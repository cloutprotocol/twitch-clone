export const formatViewerCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    const formatted = (count / 1000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(count / 1000)}K` : `${formatted}K`;
  } else if (count < 1000000000) {
    const formatted = (count / 1000000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(count / 1000000)}M` : `${formatted}M`;
  } else {
    const formatted = (count / 1000000000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(count / 1000000000)}B` : `${formatted}B`;
  }
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};