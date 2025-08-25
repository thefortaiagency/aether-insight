# Video Upload Guidelines for Aether Insight

## Recommended Video Format for Cloudflare Stream

To ensure optimal compatibility and performance across all browsers and devices, please follow these encoding guidelines when uploading videos:

### Video Specifications
- **Container:** MP4
- **Video Codec:** H.264
- **Video Profile:** H.264 High Profile
- **Frame Rate:** 30 FPS or below
- **GOP (Group of Pictures):** Closed GOP
- **Resolution:** Up to 1920x1080 (1080p) recommended

### Audio Specifications
- **Audio Codec:** AAC
- **Sample Rate:** 44.1 kHz or 48 kHz
- **Channels:** Stereo (2 channels)

### File Size and Duration
- **Maximum File Size:** 5 GB per video
- **Maximum Duration:** No strict limit, but videos are automatically chunked every 5 minutes for optimal streaming
- **Recommended Bitrate:** 
  - 1080p: 8 Mbps
  - 720p: 5 Mbps
  - 480p: 2.5 Mbps

## Browser Compatibility

These settings ensure compatibility with:
- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Opera

## Upload Methods

### 1. Via Live Scoring Page
- Videos are automatically recorded during matches
- Auto-chunked every 5 minutes or 50MB
- Uploaded automatically when online
- Saved locally when offline

### 2. Via Test Recorder Page
- Navigate to "Test Recorder" in the menu
- Select camera and microphone
- Start recording
- Videos upload automatically when stopped

### 3. Direct Upload (Coming Soon)
- Drag and drop video files
- Batch upload support
- Progress tracking

## Performance Optimization

Videos uploaded to Cloudflare Stream benefit from:
- **Adaptive Bitrate Streaming:** Automatically adjusts quality based on viewer's connection
- **Global CDN:** Videos cached at 200+ locations worldwide
- **Automatic Encoding:** Videos converted to multiple quality levels
- **Bandwidth Optimization:** clientBandwidthHint set to 1.0 for reliable playback

## Troubleshooting

### Video Not Playing
1. Check video format matches specifications above
2. Ensure video has finished processing (yellow "Processing" badge)
3. Try refreshing the page
4. Check browser console for errors

### Slow Upload
1. Check internet connection speed
2. Consider reducing video resolution
3. Enable auto-chunking for long recordings

### Browser Issues
- **Safari:** Ensure H.264 codec is used
- **Mobile:** May require user interaction to start playback
- **Firefox:** Check that AAC audio codec is used

## Support

For video-related issues, contact support with:
- Browser and version
- Video ID (shown in technical details)
- Error messages from console
- Original video format details