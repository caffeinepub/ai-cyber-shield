# AI Cyber Shield

## Current State
New project — no existing implementation.

## Requested Changes (Diff)

### Add
- Full cybersecurity platform with 7 modules
- Dashboard with India cyber threat map and live stats
- Deepfake Detector: upload image/video, returns simulated deepfake probability score
- Fake Job Scam Detector: paste job description/email/link, returns scam probability score
- Password Leak Checker: enter email, simulated breach check + password strength analyzer
- QR Code Scam Detector: paste URL or use camera scan, returns fraud risk score
- Cyberbullying Detector: paste messages/comments, detects toxic language with severity score
- Public WiFi Security Scanner: enter network name, returns security risk assessment
- Cyber Threat Map Dashboard: mock real-time India threat map with scam trends and phishing alerts

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend: store scan history per module (deepfake, job scam, password, QR, cyberbullying, wifi), rule-based analysis functions, threat stats data
2. Frontend: dark cybersecurity theme with sidebar navigation, 7 module pages + main dashboard
3. Dashboard: India threat map (SVG/Chart), recent alerts feed, threat statistics counters
4. Each module: input form + analysis result card with probability/risk score visualization
5. QR module: camera scanner integration + URL paste fallback
6. Simulated AI analysis using rule-based heuristics (keyword matching, pattern detection, scoring)
