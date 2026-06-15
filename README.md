<p align="center">
  <a href="https://konnected.io/?utm_campaign=homebridge" title="Konnected Plugin for Homebridge"><img alt="Konnected Plugin for Homebridge" src="https://raw.githubusercontent.com/HerkDriver/homebridge-konnected/master/branding/Konnected_w_Homebridge.svg?sanitize=true" width="500px"></a>
</p>

<span align="center">

# Homebridge Konnected Plugin (v2 Fork)

[![npm Release](https://flat.badgen.net/npm/v/homebridge-konnected-v2?icon=npm)](https://www.npmjs.com/package/homebridge-konnected-v2) [![npm Download Total](https://flat.badgen.net/npm/dt/homebridge-konnected-v2?icon=npm)](https://www.npmjs.com/package/homebridge-konnected-v2) [![GitHub Release](https://flat.badgen.net/github/release/HerkDriver/homebridge-konnected?icon=github)](https://github.com/HerkDriver/homebridge-konnected/releases)

[![Homebridge 2.x ready](https://flat.badgen.net/badge/homebridge/2.x%20ready/57277c)](https://github.com/homebridge/homebridge/releases) [![Apple HomeKit](https://flat.badgen.net/badge/apple/homekit/f89f1a?icon=apple)](https://www.apple.com/ios/home/) [![License: MIT](https://flat.badgen.net/badge/license/MIT/blue)](./LICENSE)

</span>

> ### 🔱 About this fork
> This is a community-maintained fork of the original [**homebridge-konnected**](https://github.com/mkormendy/homebridge-konnected) plugin created by [Mike Kormendy](https://github.com/mkormendy). The original was last updated for Homebridge 1.x; this fork updates it to run on **Homebridge 2.x** and adds new functionality. All credit for the original plugin goes to Mike Kormendy and the Konnected community — see [Credits](#credits) below.
>
> It is published to npm under a new name (**`homebridge-konnected-v2`**) so it can coexist with the original. This fork is **not** affiliated with or endorsed by konnected.io or the original author, and is **not** (currently) a Homebridge Verified plugin.

## What's New in This Fork

* **Homebridge 2.x compatibility.** Updated engine requirements (Node.js 22/24, Homebridge 1.8+/2.x) and verified against the Homebridge 2.x / HAP-NodeJS v2 type definitions.
* **Per-mode entry & exit delays.** You can now set **different entry and exit delay times for each arming mode** — Home/Stay, Night, and Away — instead of one shared value for all modes. See [Per-Mode Entry & Exit Delays](#per-mode-entry--exit-delays).
* **Dependency & security cleanup.** Removed the deprecated `ip` package (replaced with Node's built-in `os`) and the `uuid` package (replaced with Node's built-in `crypto.randomUUID()`), and removed a `preinstall` script that modified the user's system. No new runtime dependencies were added.

## Supported Features

<div align="left">
  <b>Native HomeKit Security System Control</b>
  <ul>
    <li>Arm/Disarm Security System</li>
    <li>Optional Home/Stay and Night Modes</li>
    <li>Configurable Sensor Security System Triggering</li>
    <li>Configurable Entry <i>and</i> Exit Delay Times — now per arming mode</li>
    <li>Traditional Alarm System Integration</li>
    <li>Panic Button via Alarm Siren Switch</li>
    <li>Inverting Sensors</li>
    <li>Switch Trigger States (high vs low)</li>
  </ul>
  <b>Sensor States</b>
  <ul>
    <li>Contact</li>
    <li>Motion</li>
    <li>Glass Break</li>
    <li>Temperature</li>
    <li>Humidity</li>
    <li>Smoke</li>
    <li>Water Leak</li>
  </ul>
  <b>Switches/Actuators</b>
  <ul>
    <li>Beeper</li>
    <li>Siren</li>
    <li>Strobe Light</li>
    <li>Generic Switch</li>
  </ul>
</div>

## Installation

Install through the Homebridge UI by searching for **`homebridge-konnected-v2`** on the Plugins tab, or from the command line:

```sh
npm install -g homebridge-konnected-v2
```

> **Requirements:** Homebridge v1.8+ or v2.x running on Node.js 22 or 24.

After installing, configure the plugin from the Homebridge UI's plugin settings screen (the configuration form is provided automatically).

## Configuration

The core configuration (panels, zones, sensor and switch assignments, security-system behaviour) is unchanged from the original plugin. The original project's wiki remains the most complete reference for those options:

* [Installation](https://github.com/mkormendy/homebridge-konnected/wiki/1.-Installation)
* [Configuration](https://github.com/mkormendy/homebridge-konnected/wiki/2.-Configuration)
* [Particulars](https://github.com/mkormendy/homebridge-konnected/wiki/3.-Particulars)
* [Troubleshooting](https://github.com/mkormendy/homebridge-konnected/wiki/4.-Troubleshooting)

> Note: those wiki pages describe the original plugin. Everything there still applies to this fork, with the additions documented below.

### Per-Mode Entry & Exit Delays

The original plugin used a single entry delay and a single exit delay applied to every arming mode. This fork lets you set a **different delay per HomeKit arming mode** — Home/Stay, Night, and Away — for both entry and exit.

How it works:

* The existing **Delay (seconds)** field is now the *shared default* — it applies to any mode that does not have its own override.
* New optional override fields appear under both **Entry Delay Settings** and **Exit Delay Settings** in the plugin settings: a **Home/Stay**, **Night**, and **Away** delay.
* Leave an override blank to fall back to the shared delay. A value of `0` means **instant** (no delay) for that mode.
* The exit delay and the audible beeper countdown are now independent: a mode can have a **silent** exit delay (a delay with no beeping), which wasn't possible before.

These fields are available in the Homebridge UI settings form — no manual JSON editing required. If you do edit `config.json` directly, the relevant section looks like this:

```json
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
```

In this example: **Away** uses a 45-second entry and 60-second exit delay with an audible countdown; **Night** has no entry delay and a silent 10-second exit delay; **Home/Stay** is instant; and any mode without an override falls back to the shared 30-second value.

This is fully backward compatible — an existing configuration that only sets `delay` behaves exactly as before, with that value applied to every mode.

## Credits

This plugin would not exist without the original work of **[Mike Kormendy](https://github.com/mkormendy)**, who created and maintained [homebridge-konnected](https://github.com/mkormendy/homebridge-konnected). If you find this plugin useful, please consider supporting Mike for the original work via [GitHub Sponsors](https://github.com/sponsors/mkormendy), [PayPal](https://www.paypal.me/mikekormendy), or [Ko-fi](https://ko-fi.com/mikekormendy).

Thanks also to the contributors acknowledged in the original project, including [@bwp91](https://github.com/bwp91), [@oznu](https://github.com/oznu), [@NorthernMan54](https://github.com/NorthernMan54), and [@mkellsy](https://github.com/mkellsy), and to the Homebridge and Konnected communities.

## License

Released under the [MIT License](./LICENSE). Original work Copyright © 2021 konnected.io / Mike Kormendy. Fork modifications Copyright © 2025 the fork maintainer(s).
