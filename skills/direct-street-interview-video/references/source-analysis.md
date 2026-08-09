# Source analysis and repairs

## Evidence status

- Input class: user-supplied AIGC demonstration video plus a matching prompt text file.
- Full playback: video and audio streams decoded completely without error.
- Video: H.264, 720 × 1280 portrait, 24 fps, 10.125 seconds.
- Audio: AAC stereo, approximately 10.112 seconds.
- Source post or creator URL: not supplied. Do not invent one.
- The MP4 metadata records a MiniMax H3 reference-video workflow and a 10-second generation duration.
- The public Electron preview copies the original video and audio streams into a new MP4 container while removing embedded workflow metadata and local path strings. Its release hash is recorded separately from the original source hash.

## Observed audiovisual structure

The video is a single continuous first-person walk-and-talk on a leafy urban sidewalk. The on-camera subject approaches while speaking, stays centered as the camera backpedals, uses small hair, shoulder, and hand gestures, and maintains direct eye contact. Background cars, fence lines, tree trunks, and alternating sun patches create continuous parallax and location proof. The framing gradually tightens from a wider torso view to a conversational medium close view. No clear second setup or cut is visible in the full sampled timeline.

The most reusable features are not the person, wardrobe, street, or dialogue. They are:

1. a single readable social premise;
2. one continuous walking route;
3. relationship change expressed by distance, gaze, pace, and gesture;
4. first-person handheld camera movement motivated by the subject;
5. environment, light, and sound moving coherently around the subject.

## Prompt-to-output mismatch

The supplied text declares a 15-second result and starts a second shot at 10 seconds. The embedded generation workflow requests about 10 seconds, and the decoded result lasts 10.125 seconds. The second setup therefore has no usable time to unfold. The text also contains too many dialogue turns for a natural 10-second delivery and makes an unsupported 4K claim while the delivered file is 720 × 1280.

## Repairs encoded by this Skill

- Bind all beats to the actual target duration, not a copied line in the source prompt.
- Reserve the final portion for a readable resolved state instead of starting a new scene at the endpoint.
- Reduce dialogue before accelerating speech.
- Keep a single route and one primary camera behavior when the concept is continuous.
- Describe observable image quality rather than inventing resolution metadata.
- Prefer verbal or gestural positioning; physical contact is opt-in, motivated, and consent-led.
- Preserve only abstract mechanics. Change people, wardrobe, location, dialogue, route, framing, color, and ending.
