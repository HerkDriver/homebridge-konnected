# Homebridge Konnected — Homebridge v2 compatibility update (1.3.2 → 1.4.0)

## Summary
This plugin was already in good structural shape for Homebridge v2: it is
authored in TypeScript, published as ESM (`"type": "module"`), imports HAP
types from `homebridge` (not directly from the renamed `@homebridge/hap-nodejs`),
and uses the modern promise-based `onGet`/`onSet` characteristic handlers.
Every HomeKit Service and Characteristic it uses still exists in HAP v2.

As a result the changes required for v2 were small. The rest of the changes
fix a latent bug and remove a deprecated/vulnerable dependency.

## Changes made

### Homebridge v2 compatibility
- **package.json `engines`**
  - `node`: `>=18.0.0` → `^22.12.0 || ^24.0.0` (Homebridge v2 requires Node 22+)
  - `homebridge`: `>=1.7.0` → `^1.8.0 || ^2.0.0`
- **package.json `devDependencies`**
  - `homebridge`: `^1.7.0` → `^2.0.0` (build and type-check against v2)
  - `@types/node`: `^20` → `^22`

### Dependency cleanup / security
- **Removed the `ip` package** (and `@types/ip`). It is deprecated and
  carries a published security advisory. Its single use, `ip.address()`,
  is replaced by a new `getSystemIpAddress()` helper in `src/utilities.ts`
  built on Node's built-in `os.networkInterfaces()`.
- **Removed `@types/node-fetch`** — those are the typings for node-fetch v2,
  but the plugin uses node-fetch v3 (which ships its own types). Having the
  v2 typings installed can cause type conflicts. `node-fetch` itself is kept:
  all three fetch calls pass a custom `http.Agent` via the `agent` option to
  force `keepAlive: false`, which the global/undici `fetch` does not support.

### Bug fixes
- **`src/constants.ts` — `ALARM_VALUES_TO_NAMES`** previously always returned
  `undefined`: the `Object.entries(...).find(...)` result was never returned,
  and `.find()` returns the matched `[name, number]` entry rather than the
  name. It now returns the matched name (or `undefined` if not found).
  (Note: this helper is currently not referenced elsewhere, but the fix
  removes the latent bug.)
- **`src/utilities.ts` — `ReplaceCircular`** now has explicit parameter and
  return types instead of relying on implicit `any`.

## What you must do to build and test (requires network / your machine)
These steps could not be run in the editing environment because it has no
network access.

1. From the plugin folder:
       npm install
       npm run build
   `npm install` will regenerate `package-lock.json` (it was removed so it
   does not reinstall the dropped dependencies).
2. Fix any TypeScript errors that surface when compiling against the
   Homebridge v2 / HAP-NodeJS v2 type definitions. These types are stricter
   in places; the build is the authoritative check and could not be performed
   offline here.
3. Test on a non-production Homebridge instance (ideally as a child bridge so
   a crash does not take down your whole Homebridge):
       npm link            # or: npm install -g .
   then restart Homebridge and confirm zones, the security system, switches,
   and temperature/humidity sensors behave as before.

## Synology-specific notes
- Confirm your Synology Homebridge is running on **Node.js 22+**; Homebridge
  v2 will not run on Node 18/20.
- Homebridge v2 defaults the mDNS advertiser to **avahi**. If HomeKit tiles
  show "No Response" after upgrading, switch the advertiser back to
  **Bonjour HAP** in Homebridge UI → Settings → mDNS Advertiser.

## Not changed (intentionally, to avoid scope creep / risk)
- `node-fetch` retained (see above).
- The unusual `preinstall` script that installs Homebridge globally
  (`npm list -g homebridge || npm install -g homebridge`) was left as-is.
- No HomeKit feature changes (e.g. battery service, tamper, faster polling)
  were made — those are open design decisions to discuss separately.

---

# Feature: per-mode entry & exit delays (added in 1.4.0)

Previously the security system used a single entry delay and a single exit
delay for every armed mode. You can now set a different delay for each
HomeKit arming mode — Home/Stay, Night, and Away — for both entry and exit.

## How it works
- The existing **Delay (seconds)** field is now the *shared default* — it
  applies to any mode that does not have its own override.
- Three new optional override fields were added under both
  **Entry Delay Settings** and **Exit Delay Settings**:
  - Home/Stay delay
  - Night delay
  - Away delay
- Leave an override blank to fall back to the shared delay. A value of `0`
  means instant (no delay) for that mode.
- These appear automatically in the Homebridge UI plugin settings; no manual
  JSON editing is required.

## Behaviour change worth knowing
In the old code the exit delay was only honoured for modes selected under
"audible beeper countdown" — other modes armed instantly even if a delay was
configured. The delay and the audible countdown are now decoupled:
- the exit delay is always honoured for any mode that has a non-zero delay, and
- the audible beeper countdown is a separate choice (still controlled by the
  existing "audible beeper countdown" mode selection; default = Away only).

So a mode can now have a silent exit delay (delay with no beeping), which was
not previously possible.

## Example config.json (advanced section)
    "advanced": {
      "entryDelaySettings": {
        "delay": 30,
        "delayHome": 0,
        "delayNight": 0,
        "delayAway": 45
      },
      "exitDelaySettings": {
        "delay": 30,
        "delayHome": 0,
        "delayNight": 10,
        "delayAway": 60,
        "audibleBeeperModes": ["1"]
      }
    }

In this example: Away gets a 45s entry / 60s exit delay with an audible
countdown; Night gets no entry delay and a silent 10s exit delay; Home/Stay
is instant; any mode without an override would use the shared 30s value.

## Backward compatibility
Fully backward compatible. An existing config with only `delay` set behaves
exactly as before (that value applies to every mode).
