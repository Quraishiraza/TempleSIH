# 📹 Video Setup Guide for YOLO Crowd Detection

## Required Videos

You need **3 video files** to simulate different temple zones:

1. **temple_crowd_1.mp4** - Main Entrance (threshold: 40 people)
2. **temple_crowd_2.mp4** - Darshan Queue (threshold: 60 people)
3. **temple_crowd_3.mp4** - Exit Area (threshold: 30 people)

---

## Video Requirements

- **Format**: MP4, AVI, or MOV
- **Resolution**: 720p or higher (1280x720 recommended)
- **Duration**: 10-30 seconds per video
- **FPS**: 25-30 fps
- **Content**: Crowd scenes with people visible

---

## Where to Get Videos

### Option 1: Download from YouTube (FREE)

**Step 1**: Install yt-dlp
```bash
pip install yt-dlp
```

**Step 2**: Search for crowd videos
- "temple crowd management"
- "kumbh mela crowd"
- "tirupati darshan queue"
- "religious gathering crowd"

**Step 3**: Download
```bash
# Navigate to this directory
cd /Users/rabdin/Desktop/sih01/yolo-service/videos

# Download video (replace URL)
yt-dlp -f "best[height<=720]" "YOUTUBE_URL" -o "temple_crowd_1.mp4"
```

### Option 2: Stock Video Sites (FREE)

**Pexels** (https://www.pexels.com/search/videos/crowd/)
- Search: "crowd", "people walking", "busy street"
- Download 720p version
- Rename to temple_crowd_X.mp4

**Pixabay** (https://pixabay.com/videos/search/people/)
- Search: "crowd", "temple", "festival"
- Free for commercial use

**Videvo** (https://www.videvo.net/)
- Search: "crowd management", "busy area"

### Option 3: Use Sample Videos

If you can't find specific temple videos, any crowd footage works:
- Shopping mall crowds
- Train station crowds
- Stadium crowds
- Street festivals
- Busy markets

---

## Quick Setup Commands

```bash
# Navigate to videos directory
cd /Users/rabdin/Desktop/sih01/yolo-service/videos

# Example: Download from Pexels
# 1. Go to https://www.pexels.com/search/videos/crowd/
# 2. Download 3 different crowd videos
# 3. Rename them:
mv ~/Downloads/pexels-crowd-1.mp4 temple_crowd_1.mp4
mv ~/Downloads/pexels-crowd-2.mp4 temple_crowd_2.mp4
mv ~/Downloads/pexels-crowd-3.mp4 temple_crowd_3.mp4
```

---

## Recommended Video Search Terms

For YouTube:
- "temple darshan queue tirupati"
- "kumbh mela crowd 2024"
- "religious festival crowd management"
- "temple entrance crowd india"

For Stock Sites:
- "busy crowd walking"
- "people queue line"
- "crowded public place"
- "festival gathering"

---

## Testing

Once you have videos, test the YOLO service:

```bash
# Start YOLO service
cd /Users/rabdin/Desktop/sih01/yolo-service
source venv/bin/activate
python app.py

# Service will show which zones are active
```

---

## Troubleshooting

**Videos not detected?**
- Check file names match exactly: temple_crowd_1.mp4, temple_crowd_2.mp4, temple_crowd_3.mp4
- Ensure files are in the `/videos/` directory
- Check file isn't corrupted (try playing in VLC)

**Video too large?**
- Compress using ffmpeg:
```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -vf scale=1280:720 output.mp4
```

**Need different videos?**
- You can use same video 3 times (just copy it)
- Or use only 1-2 videos (edit config.py to remove zones)

---

## Current Directory Structure

```
videos/
├── README.md (this file)
├── temple_crowd_1.mp4 (TO BE ADDED)
├── temple_crowd_2.mp4 (TO BE ADDED)
└── temple_crowd_3.mp4 (TO BE ADDED)
```

---

## For Demo

**Ideal setup**:
- Video 1: Low-moderate crowd (20-40 people)
- Video 2: High crowd (50-70 people) - triggers alerts!
- Video 3: Normal crowd (15-30 people)

This will demonstrate:
✅ Normal monitoring
✅ Alert triggering
✅ Different crowd levels

---

**Need help?** The YOLO system works with ANY video containing people. Even generic crowd footage will work perfectly for the demo!

