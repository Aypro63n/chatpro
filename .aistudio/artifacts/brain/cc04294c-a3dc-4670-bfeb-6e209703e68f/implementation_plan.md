# Implementation Plan - Carousel Alignment & ChatLayout Glitch Fix

## Objectives

1. **WorksWheel Carousel Layout (`works-wheel.tsx` & `index.css`)**:
   - Ensure the 3D stage sits cleanly on the left and index buttons sit on the right without overflowing or hiding titles.
2. **ChatLayout Glitch Fix (`ChatLayout.tsx` & `index.css`)**:
   - Fix container flex/height properties (`h-full flex-1 min-h-0 overflow-hidden`) so the chat box UI renders properly on login.

## Execution Steps

### Step 1: Fix WorksWheel Stage CSS & Alignment
- Adjust `.works-wheel` grid and `.works-wheel-stage` positioning in `index.css`.

### Step 2: Fix ChatLayout Container Styles
- Ensure `ChatLayout` root container fills available height (`h-full flex-1 flex min-h-0 overflow-hidden`).

### Step 3: Build & Verification
- Compile and test applet build.
