# Attendo - Project Research & Design Iterations

## Iteration 1: Initial Concept (Naive Design)

### What We Thought
- Lecturer generates a QR code
- Student scans the QR code **from their own phone screen**
- Student submits attendance

### The Problem
This design has a major security flaw — **proxy attendance**.

A student who is not in class can:
1. Ask a friend in class to screenshot the QR
2. Send it over WhatsApp
3. The absent student scans it from home and marks attendance

Since the QR was static (didn't change), one screenshot was enough to cheat the entire system. The whole point of the system — ensuring physical presence — was broken.

---

## Iteration 2: Rotating QR (Better but Still Flawed)

### What We Added
- QR code rotates every **30 seconds**
- QR contains a timestamp and HMAC signature
- Old QRs expire after **60 seconds**

### How It Improved Security
- Screenshots become useless after 60 seconds
- A student outside class would need the QR sent to them in real-time (within 60s)
- Harder to cheat, but still possible if someone livestreams the QR

### Still a Problem
- A determined group of students could set up a live video feed of the QR
- No proof the student is physically in the classroom

---

## Iteration 3: Current Design (Physical Presence Required)

### The Key Insight
**The student should NOT scan from their own phone screen.**

The correct flow is:
```
Lecturer laptop/projector     Student phone
┌─────────────────────┐       ┌──────────────┐
│                     │       │              │
│   [QR CODE HERE]    │  ←──  │   📷 camera  │
│                     │  scan │   scanning   │
└─────────────────────┘       └──────────────┘
```

- The QR is displayed on the **lecturer's screen or projector**
- The student opens the Attendo app on their phone
- The student **points their camera at the lecturer's screen** to scan

### Security Layers Added

| Layer | How It Works | What It Prevents |
|---|---|---|
| Rotating QR (30s) | QR changes every 30 seconds | Screenshot reuse |
| HMAC Signature | QR is cryptographically signed | Fake/forged QR codes |
| Timestamp Expiry (60s) | QR invalid after 60 seconds | Delayed screenshot attacks |
| GPS Validation | Student must be within 100m of classroom | Remote attendance fraud |
| Duplicate Check | One attendance per student per session | Scanning twice |

### Why This Works
- To cheat, a student outside class would need to:
  1. Be physically close enough to the classroom GPS coordinates (within 100m)
  2. Have access to the current QR within 60 seconds

- If they are 100m from the classroom, they might as well just walk in.

---

## Key Lessons

1. **Security must be designed from the start** — adding it later forces redesigns
2. **The scanning direction matters** — student scans lecturer's screen, not the other way
3. **Multiple layers are better than one** — rotating QR + GPS + HMAC together are much stronger than any single check
4. **Physical presence = camera pointing at a real screen** — this cannot be faked remotely

---

*Last Updated: 2026-03-08*
