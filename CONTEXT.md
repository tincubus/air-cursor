# Air Cursor

Web demo that controls an on-screen **Aim Point** with a single **Active Hand** in front of a webcam — like a Wacom tablet in the air.

## Language

**Interaction Canvas**:
The right-hand panel where the **Aim Point** is shown and where playground objects respond to pointing and **Pinch**.
_Avoid_: main area, game board, screen

**Tracking Panel**:
The left-hand panel showing the live webcam feed and hand skeleton overlay.
_Avoid_: camera view, video panel

**Aim Point**:
The virtual pointer position on the **Interaction Canvas**, driven by the index fingertip.
_Avoid_: cursor, mouse, dot

**Active Hand**:
The single hand (left or right) the user chose during onboarding; only this hand drives tracking.
_Avoid_: dominant hand, primary hand

**Pinch**:
Bringing thumb and index finger together. A short **Pinch** release on the **Interaction Canvas** means click; holding **Pinch** means drag.
_Avoid_: grab, tap, select gesture

**Calibration**:
A one-time (per device) ritual where the user moves their index finger in a guide box so the system learns how hand motion maps to the **Interaction Canvas**.
_Avoid_: setup, tuning, alignment

## Relationships

- **Calibration** applies to one **Active Hand** and maps fingertip motion to the **Interaction Canvas**
- The **Aim Point** exists only on the **Interaction Canvas**, never on the **Tracking Panel**
- **Pinch** on the **Interaction Canvas** triggers click or drag on playground objects under the **Aim Point**

## Example dialogue

> **Dev:** "Does the pointer appear over the webcam?"
> **Domain expert:** "No — the **Aim Point** is only on the **Interaction Canvas**. The **Tracking Panel** is for trust and feedback."

## Flagged ambiguities

- "cursor" in the product name means **Aim Point**, not the OS mouse cursor.
