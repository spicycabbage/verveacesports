-- Long-form English product copy (specs, in-the-box, FAQ) sourced from
-- manufacturer product pages and manuals (mgigolf.com, motocaddy.ca, bleequp.com).
-- Format is parsed by lib/catalog/description.ts: "### " heading, "- " list,
-- a heading ending in "?" becomes FAQPage JSON-LD.

update products as p
set description = v.description
from (
  values

  ('mgi-ai-navigator-halo-halo-eye-bundle', $d$MGI Ai Navigator Halo remote-control electric golf caddy bundled with the Halo Eye 2D LiDAR sensor, which adds Follow Me, Return Home and Point-to-Point driving plus always-on obstacle avoidance.

### Halo Eye modes
- Follow Me: trails about 2.5 m behind you as you walk
- Return Home and Point-to-Point: drives itself on mapped fairways and stops within about 5 m of the target
- Obstacle Avoidance: always on, scanning a plane about 1 m above the ground
- Mounts on an arm and draws power from the caddy over USB-C, so it uses some battery range
- Remove Halo Eye before folding the caddy

### Halo specs
- 24 V, 299 Wh lithium battery in a fire-resistant metal case, up to 36 holes per charge
- Independent brushless in-hub motors, 20 speed settings
- Full-direction remote with 100–200 m range, charges over USB-C
- 4" colour touchscreen GPS with about 40,000 courses
- Geo Protect slows or stops the caddy near mapped hazards
- Gyroscope Straight Tracker, downhill speed control, enhanced 5th wheel, IPX4
- 12.5 kg (27.6 lb) without battery, 15.1 kg (33.3 lb) with battery
- Folded: 68.6 × 38.1 × 35.6 cm (27 × 15 × 14 in)
- Maximum load: 20 kg (45 lb)

### In the box
- Ai Navigator Halo, 2 front wheels, 2 all-terrain rear wheels
- Lithium battery and 24 V smart charger
- Remote with USB-C cable, O-rings, axle lube cloth, quick start guide
- Halo Eye sensor, mounting arm with USB-C cable, cleaning cloth, quick start guide

### Does Halo Eye work with other MGI caddies?
No. Halo Eye works only with the Ai Navigator Halo, and the Halo needs firmware 2.1.5 or later.

### What warranty does it have?
MGI covers the Halo for 3 years on parts and 3 years on the lithium battery and charger. Halo Eye has a separate 2-year limited warranty. Register the product with MGI to activate coverage.$d$),

  ('mgi-ai-navigator-halo', $d$MGI's flagship remote-control electric golf caddy: brushless in-hub motors, a 4" GPS touchscreen with Geo Protect hazard mapping, and a compact fold about 20% smaller than the Zip Navigator AT. Ready for the Halo Eye LiDAR follow sensor.

### Key specs
- 24 V, 299 Wh lithium battery in a fire-resistant metal case, up to 36 holes per charge
- Independent brushless in-hub motors, 20 speed settings
- Full-direction remote with 100–200 m range, charges over USB-C in about 3 hours
- The caddy stops if it loses contact with the remote for 5 seconds
- 4" colour touchscreen GPS with about 40,000 courses
- Geo Protect slows or stops the caddy near mapped hazards
- Gyroscope Straight Tracker, downhill speed control, enhanced 5th wheel
- Park brake on the dial or the remote
- Bluetooth, USB-C port, pairs with the MGI SlimPRO rangefinder, IPX4
- 12.5 kg (27.6 lb) without battery, 15.1 kg (33.3 lb) with battery
- Folded: 68.6 × 38.1 × 35.6 cm (27 × 15 × 14 in), wheels retract instead of coming off
- Maximum load: 20 kg (45 lb)

### In the box
- Ai Navigator Halo, 2 front wheels, 2 all-terrain rear wheels
- Lithium battery and 24 V smart charger
- Remote with USB-C cable, O-rings, axle lube cloth, charger manual, quick start guide

### Halo or Ai Navigator GPS+?
The Halo uses brushless in-hub motors instead of the GPS+'s twin 230 W motors, adds Geo Protect and Halo Eye support, folds without removing the wheels, and is about 2.6 kg (5.7 lb) lighter. Its remote charges over USB-C in about 3 hours versus about 6 hours for the GPS+.

### Can I add follow-me later?
Yes. The Halo Eye sensor adds Follow Me, Return Home, Point-to-Point and obstacle avoidance. It is sold as the Ai Navigator Halo + Halo Eye bundle.

### What warranty does it have?
MGI covers the Halo for 3 years on parts and 3 years on the lithium battery and charger. Register the product with MGI to activate coverage.$d$),

  ('mgi-ai-navigator-gps', $d$MGI Ai Navigator GPS+ remote-control electric golf caddy with a built-in 4" colour GPS touchscreen preloaded with 40,000+ courses, twin 230 W motors, and a five-wheel chassis for stability on slopes.

### Key specs
- 24 V lithium battery, up to 36 holes per charge
- Twin 230 W motors with brake, 20 speed settings
- Full-direction remote with 100–200 m range
- 4" colour touchscreen GPS with 40,000+ courses
- MGI app for course maps and scoring, Bluetooth phone notifications
- Gyroscope Straight Tracker and downhill speed control
- Set speed at the console without the remote
- Quick-release all-terrain rear wheels, USB port, IPX4
- 15.1 kg (33.3 lb) without battery, 17.7 kg (39 lb) with battery
- Open: 116 × 57.5 × 100 cm (45.7 × 22.6 × 39.4 in)
- Folded with rear wheels inverted: 62 × 46 × 39 cm (24.4 × 18.1 × 15.4 in)
- Maximum load: 20 kg (45 lb)

### In the box
- Caddy, 2 front wheels, 2 all-terrain rear wheels
- Lithium battery, charger and manual
- Remote with holder and clip, USB lead, O-rings, lube cloth, quick start guide

### Ai Navigator GPS+ or Halo?
The GPS+ has twin 230 W motors and the same 4" GPS screen. The Halo moves to brushless in-hub motors, adds Geo Protect hazard mapping and Halo Eye follow-me support, folds smaller without removing wheels, and is about 2.6 kg lighter.

### What warranty does it have?
MGI covers the GPS+ for 3 years on parts and 3 years on the battery and charger. Register the product with MGI to activate coverage.$d$),

  ('mgi-zip-navigator-at-all-terrain', $d$MGI Zip Navigator AT is a remote-control electric golf caddy built for hilly, uneven courses: two swivelling front wheels, a fold-out 5th wheel, and all-terrain rear tread for grip and stability on side slopes.

### Key specs
- 24 V lithium battery, up to 36 holes per charge
- Twin 230 W motors
- Full-direction remote (forward, reverse, left, right, speed) with 100–200 m range
- Gyroscope Straight Tracker and downhill speed control
- Distance modes, competition mode, USB port
- Deploy the 5th wheel whenever the caddy is in use
- 14.1 kg (31 lb) without battery, 16.8 kg (37 lb) with battery
- Open: 117 × 58 × 104 cm (46 × 23 × 41 in)
- Folded: 71 × 48 × 43 cm (28 × 19 × 17 in)
- Maximum load: 20 kg (45 lb)

### In the box
- Caddy, 24 V lithium battery and charger
- Remote, GPS holder, spare speed dial, axle lubricant
- Manual and quick start guide

### Zip Navigator AT or Zip Navigator?
The AT has two front wheels and a 5th wheel for stability on slopes and rough ground. The standard Zip Navigator has a single front wheel and is about 12% lighter and 25% smaller folded, which suits flatter courses and smaller trunks.

### What warranty does it have?
MGI covers the Zip Navigator AT for 3 years on parts and 3 years on the battery and charger. Register the product with MGI to activate coverage.$d$),

  ('mgi-zip-navigator', $d$MGI Zip Navigator is a remote-control electric golf caddy with a single swivelling front wheel and a fold-down 4th wheel, sized to fold small for the trunk.

### Key specs
- 24 V lithium battery, up to 36 holes per charge
- Twin 230 W motors
- Full-direction remote (forward, reverse, left, right, speed) with 100–200 m range
- Gyroscope Straight Tracker and downhill speed control
- All-terrain rear tread with quick-release rear wheels, USB port
- 13 kg (28.6 lb) without battery, 15.9 kg (35 lb) with battery
- Open: 80 × 59 × 104 cm (31.5 × 23.2 × 40.9 in)
- Folded: 70 × 47 × 42 cm (27.6 × 18.5 × 16.5 in)
- Maximum load: 20 kg (45 lb)

### In the box
- Caddy, 24 V lithium battery and charger
- Remote, GPS holder, spare speed dial, axle lubricant
- Manual and quick start guide

### Zip Navigator or Zip Navigator AT?
The Zip Navigator is about 12% lighter and 25% smaller folded. The AT adds a second front wheel and a 5th wheel for steep or uneven courses.

### What warranty does it have?
MGI covers the Zip Navigator for 3 years on parts and 3 years on the battery and charger. Register the product with MGI to activate coverage.$d$),

  ('mgi-zip-x5', $d$MGI Zip X5 is a handle-controlled electric golf caddy with an electronic park brake, downhill speed control, and a Controlled Distance function that sends the cart 5–60 m ahead on its own. It has no remote.

### Key specs
- 24 V, 250 Wh lithium battery, up to 36 holes per charge
- 230 W motor with brake
- Electronic park brake and downhill speed control
- Controlled Distance: sends the caddy 5–60 m (or yards) ahead
- Resettable odometers, USB port
- Swivelling front wheel that locks straight, fold-down 4th wheel
- 11.75 kg (25.9 lb) without battery, 13.9 kg (30.6 lb) with battery
- Open: 80 × 59 × 104 cm (31.5 × 23.2 × 40.9 in)
- Folded: 70 × 47 × 42 cm (27.6 × 18.5 × 16.5 in)
- Maximum load: 20 kg (45 lb)

### In the box
- Caddy, lithium battery and charger
- GPS holder, spare speed dial, axle lubricant
- Manual and quick start guide

### Does the Zip X5 have a remote?
No. You steer with the handle and set speed on the dial. For a remote-control MGI, look at the Zip Navigator or Ai Navigator range.

### Zip X5 or Zip X1?
The X5 adds the electronic park brake, downhill speed control, Controlled Distance and a lockable swivel front wheel. The X1 is about 1.8 kg (3.9 lb) lighter and simpler.

### What warranty does it have?
MGI covers the Zip X5 for 3 years on parts and 3 years on the battery and charger. Register the product with MGI to activate coverage.$d$),

  ('mgi-zip-x1', $d$MGI Zip X1 is MGI's entry-level electric golf caddy: handle control with 9 speed settings, a 36-hole lithium battery, and a light 10 kg (22 lb) frame. It has no remote.

### Key specs
- 24 V, 250 Wh lithium battery, up to 36 holes per charge
- 230 W motor, 9 speed settings
- Fixed front wheel, fold-down 4th wheel
- Battery indicator, USB port
- 10 kg (22 lb) without battery, 12.1 kg (26.7 lb) with battery
- Open: 80 × 59 × 104 cm (31.5 × 23.2 × 40.9 in)
- Folded: 70 × 47 × 42 cm (27.6 × 18.5 × 16.5 in)
- Maximum load: 20 kg (45 lb)

### In the box
- Caddy, lithium battery and charger
- GPS holder, spare speed dial, axle lubricant
- Manual and quick start guide

### Does the Zip X1 have a remote?
No. The X1 is handle-controlled. For a remote-control MGI, look at the Zip Navigator or Ai Navigator range.

### Zip X1 or Zip X5?
The X5 adds an electronic park brake, downhill speed control, a distance function and a lockable swivel front wheel for hilly courses. The X1 is lighter and the better value on flatter courses.

### What warranty does it have?
MGI covers the Zip X1 for 3 years on parts and 3 years on the battery and charger. Register the product with MGI to activate coverage.$d$),

  ('mgi-e-boost-pushcart', $d$MGI E-Boost is a push cart with a motor when you want it: push or pull it like a normal cart, then hold the toggle on the handle for electric assist up hills. It also works with the battery removed.

### Key specs
- 24 V, 225 Wh Click & Go lithium battery
- 240 W brushless motor with variable speed
- Swivelling front wheel that locks straight, clutched rear wheels
- Scorecard holder, 2 ball holders, storage net, cup holder, magnetic compartment
- 4 accessory stations, USB port
- 9.8 kg (21.6 lb) without battery, 11.35 kg (25 lb) with battery
- Folded: 77.6 × 44.2 × 32 cm (30.5 × 17.4 × 12.6 in)

### In the box
- Cart and 2 all-terrain rear wheels
- 225 Wh battery and charger
- Axle lube cloth and tub, sand bucket hook, charger manual, quick start guide

### How far does it go on a charge?
MGI rates it at around 18 holes of intermittent boosting. Range depends on how often you use the motor, the terrain and the temperature.

### What warranty does it have?
MGI covers the E-Boost for 2 years on parts and 2 years on the battery and charger.$d$),

  ('motocaddy-m7-gps-2026', $d$The 2026 Motocaddy M7 GPS REMOTE is Motocaddy's flagship remote-control electric golf trolley: a 3.5" GPS touchscreen with 40,000 preloaded courses, twin 230 W motors, Downhill Control, and a cable-free CLICK 'N' CONNECT lithium battery.

### Key specs
- USB-C rechargeable handset (forward, reverse, left, right), 100 m+ range
- Drive it by remote or from the handle
- Twin 230 W motors, 9 speed settings
- Downhill Control (DHC) and Adaptive Terrain Stability (ATS)
- 3.5" touchscreen GPS: full-hole maps with a movable target, 2D/3D views and 3D flyovers
- Bluetooth phone notifications, Wi-Fi updates, performance tracking, AED locator
- 28 V CLICK 'N' CONNECT ULTRA lithium (LiFePO4) battery, 2.5 kg, charges in 3–5 hours
- 360° twin front wheels, all-terrain tyres, retractable anti-tip wheel, USB port
- Weight: 14.9 kg
- Folded: 65 × 47 × 42 cm
- Maximum load: 20 kg

### In the box
- M7 GPS REMOTE trolley and handset
- ULTRA lithium battery and charger
- Anti-tip wheel and Accessory Station

### M7 GPS REMOTE or M7 REMOTE?
They share the same remote, twin motors and chassis. The GPS model adds the 3.5" GPS touchscreen and connected features and weighs 0.5 kg more.

### Which accessories fit?
The included Accessory Station takes Motocaddy's Essential Accessory Pack: device cradle, drink holder, scorecard holder and umbrella holder, sold separately.

### What warranty does it have?
Motocaddy covers the trolley and charger for 2 years and the lithium battery for 5 years. Register the battery with Motocaddy to get the full term.$d$),

  ('motocaddy-m7-2026', $d$The 2026 Motocaddy M7 REMOTE is a remote-control electric golf trolley with twin 230 W motors, Downhill Control, Adaptive Terrain Stability, and a cable-free CLICK 'N' CONNECT lithium battery. It is the M7 GPS without the GPS screen.

### Key specs
- USB-C rechargeable handset (forward, reverse, left, right), 100 m+ range
- Drive it by remote or from the handle
- Twin 230 W motors, 9 speed settings
- Downhill Control (DHC) and Adaptive Terrain Stability (ATS)
- 2.8" LCD: speed, clock, round timer, drive/round/lifetime distance, handset battery
- Cartlock 4-digit PIN
- 28 V CLICK 'N' CONNECT ULTRA lithium (LiFePO4) battery, 2.5 kg, charges in 3–5 hours
- 360° twin front wheels, anti-tip wheel, USB port
- Weight: 14.4 kg
- Folded: 65 × 51.5 × 42 cm
- Maximum load: 20 kg

### In the box
- M7 REMOTE trolley and handset
- ULTRA lithium battery and charger
- Anti-tip wheel and Accessory Station

### M7 REMOTE or M7 GPS REMOTE?
Same remote, twin motors and chassis. Choose the GPS model if you want hole maps and yardages on the trolley instead of a separate rangefinder or watch.

### What warranty does it have?
Motocaddy covers the trolley and charger for 2 years and the lithium battery for 5 years. Register the battery with Motocaddy to get the full term.$d$),

  ('motocaddy-m5-gps-dhc-2026', $d$The 2026 Motocaddy M5 GPS DHC is a handle-controlled electric golf trolley with the same 3.5" GPS touchscreen as the M7 GPS, plus Downhill Control, an electronic parking brake and adjustable distance control. 11.2 kg.

### Key specs
- Single 230 W motor, 9 speed settings, Downhill Control (DHC)
- Electronic parking brake: turn the dial past 1 to P
- Distance control sends the trolley ahead on its own
- 3.5" touchscreen GPS: 40,000 preloaded courses, full-hole maps, 2D/3D views and 3D flyovers
- Bluetooth phone notifications, Wi-Fi updates, performance tracking, AED locator
- 28 V CLICK 'N' CONNECT ULTRA lithium (LiFePO4) battery, 2.5 kg, charges in 3–5 hours
- All-terrain tyres, USB port
- Weight: 11.2 kg
- Folded: 65 × 47 × 41 cm
- Maximum load: 20 kg

### In the box
- M5 GPS DHC trolley
- ULTRA lithium battery and charger
- Accessory Station

### M5 GPS DHC or M7 GPS REMOTE?
The M5 has one motor and no remote, but adds an electronic parking brake and is 3.7 kg lighter. Choose the M7 GPS if you want to drive the trolley by remote.

### Does it come with an anti-tip wheel?
No. Add the 28V M-Series Anti-tip Wheel (2024), which fits the M5 GPS DHC.

### What warranty does it have?
Motocaddy covers the trolley and charger for 2 years and the lithium battery for 5 years. Register the battery with Motocaddy to get the full term.$d$),

  ('motocaddy-m1-dhc-2026', $d$The 2026 Motocaddy M1 DHC is Motocaddy's entry electric golf trolley with Downhill Control, an electronic parking brake and 15–45 yard distance control, on a light 10.6 kg frame.

### Key specs
- Single 230 W motor, 9 speed settings, Downhill Control (DHC)
- Electronic parking brake
- Distance control: 15, 30 or 45 yards
- 2.8" LCD, pause and resume, Cartlock PIN, ambidextrous controls
- 28 V CLICK 'N' CONNECT ULTRA lithium (LiFePO4) battery, 2.5 kg, charges in 3–5 hours
- Inverting wheels, auto-open stand, USB port
- Weight: 10.6 kg
- Folded: 65 × 47 × 41 cm
- Maximum load: 20 kg

### In the box
- M1 DHC trolley
- ULTRA lithium battery and charger
- Accessory Station

### M1 DHC or M5 GPS DHC?
Both are single-motor handle-controlled trolleys with Downhill Control and a parking brake. The M5 adds the 3.5" GPS touchscreen and longer distance control.

### Does it come with an anti-tip wheel?
No. Add the 28V M-Series Anti-tip Wheel (2024), which fits the M1 DHC.

### What warranty does it have?
Motocaddy covers the trolley and charger for 2 years and the lithium battery for 5 years. Register the battery with Motocaddy to get the full term.$d$),

  ('motocaddy-essential-accessory-pack', $d$Motocaddy Essential Accessory Pack: the four holders most golfers add to a Motocaddy electric trolley, in one box.

### Included
- Device Cradle: adjustable phone holder
- Drink Holder
- Scorecard Holder with clear cover, storage drawer and pencil holder
- Umbrella Holder for standard umbrellas

### Which trolleys does it fit?
28V M-Series trolleys from 2018 on, 28V S-Series from 2019 on, and SE from 2024 on. It mounts on a Motocaddy Accessory Station, which comes free with every 2026 M-Series trolley. It does not fit Motocaddy push trolleys.$d$),

  ('motocaddy-28v-anti-tip-wheel-2024', $d$Motocaddy 28V M-Series Anti-tip Wheel (2024): a retractable rear wheel that stops the trolley tipping backwards on steep slopes. It can stay attached when the trolley is folded.

### Which trolleys does it fit?
2024-and-later M-Series trolleys with the CLICK 'N' CONNECT battery, including the 2026 M1 DHC and M5 GPS DHC.

### Does it fit the M7?
No. The M7 REMOTE and M7 GPS REMOTE already include their own anti-tip wheel, and this one is not compatible with them.$d$),

  ('bleequp-rover-ai-sports-glasses', $d$BleeqUp Rover AI sports camera glasses with ZEISS lenses: a 16 MP camera that tilts to −10°, 0° or 15°, 3K60 video with real-time HDR and night mode, 64 GB of storage, open-ear audio and AI safety features for riding. 53 g, IP65.

### Camera
- 16 MP photos (4656 × 3496)
- Video: 3K60, 3K30, 1080p60, 1080p30; 60 fps and 3K modes need a supported phone
- Real-time HDR, night mode, electronic image stabilization, loop recording
- 120° field of view, 3-level tilt (−10° / 0° / 15°), landscape or 9:16 portrait
- Clip length: 1 min at 3K60 and 1080p60, 5 min at 3K30, unlimited at 1080p30

### Battery and audio
- About 1 hour of video or 8 hours of audio; 1-hour quick charge
- Rover Power Plus extends that to about 5 hours of video or 48 hours of audio
- 2 open-ear speakers, 5-mic array, wind noise reduction up to 35 km/h
- Music, calls and group walkie-talkie

### AI features
- Voice commands, sports Q&A and activity recap
- Highlight detection, video search and one-tap editing in the BleeqUp app
- Emergency recording on sudden braking, with 10 seconds of pre-recording
- Proactive safety alerts from map and weather data (English)

### Build
- 53 g TR90 frame, one size, adjustable nose pad
- IP65 water and dust resistance, UV400 ZEISS lenses

### In the box
- Rover glasses and Rover magnetic charging cable
- Prescription frame insert
- Storage kit and reference guides

### Rover or Ranger?
Rover adds the tilting camera, HDR and night mode, 64 GB storage instead of 32 GB, IP65 instead of IP54, voice commands and AI safety features. Ranger is 4 g lighter and has four speakers. Lenses, prescription inserts and Power Plus are model-specific; the Bluetooth Controller works with both.

### Can I wear Rover with a prescription?
Yes. A Rover prescription frame insert is in the box; have single-vision lenses made for it. Ranger inserts and lenses do not fit Rover.

### What warranty does it have?
BleeqUp gives a 1-year limited warranty on the glasses. Lenses are not covered.$d$),

  ('bleequp-rover-ai-sports-glasses-bundle', $d$BleeqUp Rover AI sports camera glasses with ZEISS lenses, bundled with Rover Power Plus and the Bluetooth Controller for all-day rides. Add an optional photochromic lens.

### Included
- Rover AI sports glasses with ZEISS lenses (Gold or Silver)
- Rover Power Plus: 1600 mAh helmet-mounted battery, about 5 hours of video or 48 hours of audio in total
- Bluetooth Controller: handlebar remote for recording, photos and calls
- Optional photochromic lens that darkens automatically in sunlight

### Rover highlights
- 16 MP camera with 3-level tilt (−10° / 0° / 15°), 120° field of view
- 3K60 video with real-time HDR, night mode and stabilization
- 64 GB storage, open-ear speakers, 5-mic array
- Voice commands, AI highlight editing, emergency recording on sudden braking
- 53 g, IP65, UV400

### Why the bundle?
Rover records about 1 hour on its own battery. Power Plus raises that to about 5 hours, and the controller lets you start and stop recording without taking a hand off the bars. Buying them together costs less than buying each separately.

### What warranty does it have?
BleeqUp gives a 1-year limited warranty on the glasses, Power Plus and controller. Lenses are not covered.$d$),

  ('bleequp-ranger-standard-lens', $d$BleeqUp Ranger 4-in-1 AI sports camera glasses: a 16 MP POV camera with 3K60 video and a 120° field of view, open-ear speakers, and swappable UV400 sport lenses in a 49 g frame. IP54.

### Camera
- 16 MP photos (4656 × 3496)
- Video: 3K60, 3K30, 1080p60, 1080p30; 60 fps and 3K modes need a supported phone
- 120° field of view, electronic image stabilization, loop recording, data overlay
- Clip length: 1 min at 3K60 and 1080p60, 5 min at 3K30, unlimited at 1080p30
- Takes photos and video without a phone connected

### Battery and audio
- 32 GB storage, about 4.5–5.5 hours of video
- About 1 hour of video or 8 hours of audio; 1-hour quick charge
- Ranger Power Plus extends that to about 5 hours of video or 48 hours of audio
- 4 open-ear speakers (not bone conduction), 5-mic array, wind noise reduction up to 40 km/h
- Calls, music and walkie-talkie

### Smart features
- One-tap AI editing and highlights in the BleeqUp app
- Pairs with Garmin cadence and heart-rate sensors

### Build
- 49 g TR90 frame, one size, adjustable non-slip nose pad
- IP54, UV400 lenses that swap without tools

### In the box
- Ranger glasses, case and pouch
- Prescription (RX) insert frame
- Magnetic charging cable, cleaning cloth, quick start guide

### Ranger or Rover?
Ranger is lighter (49 g vs 53 g) and has four speakers. Rover adds a tilting camera, real-time HDR and night mode, 64 GB storage, IP65 and voice-controlled AI safety features. Ranger has no HDR or night mode.

### What warranty does it have?
BleeqUp gives a 1-year limited warranty on the glasses. Lenses are not covered.$d$),

  ('bleequp-ranger-zeiss-lens', $d$BleeqUp Ranger AI sports camera glasses fitted with a ZEISS Orange lens: the same 16 MP 3K60 POV camera and open-ear audio as the standard Ranger, with ZEISS optics for sharper edges and coatings that resist scratches, water and oil.

### ZEISS lens
- 18–43% light transmission, UV400
- Scratch-resistant, water-repellent and oil-repellent coatings
- Swappable with any Ranger lens

### Ranger specs
- 16 MP photos, 3K60 / 3K30 / 1080p60 / 1080p30 video; 60 fps and 3K modes need a supported phone
- 120° field of view, electronic image stabilization, loop recording
- 32 GB storage; about 1 hour of video or 8 hours of audio, 5 hours of video with Ranger Power Plus
- 4 open-ear speakers, 5-mic array, wind noise reduction up to 40 km/h
- 49 g TR90 frame, IP54

### In the box
- Ranger glasses with ZEISS Orange lens, case and pouch
- Prescription (RX) insert frame
- Magnetic charging cable, cleaning cloth, quick start guide

### What warranty does it have?
BleeqUp gives a 1-year limited warranty on the glasses. Lenses are not covered.$d$),

  ('bleequp-ranger-ultimate-bundle', $d$BleeqUp Ranger AI sports camera glasses bundled with Ranger Power Plus and the Bluetooth Controller: everything you need for long rides in one box.

### Included
- BleeqUp Ranger AI sports camera glasses
- Ranger Power Plus: 1600 mAh helmet-mounted battery, about 5 hours of video or 48 hours of audio in total
- Bluetooth Controller: handlebar remote for recording, photos and calls

### Ranger highlights
- 16 MP POV camera, 3K60 video, 120° field of view, stabilization
- 32 GB storage, 4 open-ear speakers, 5-mic array
- 49 g, IP54, swappable UV400 lenses, prescription insert included

### What warranty does it have?
BleeqUp gives a 1-year limited warranty on the glasses, Power Plus and controller. Lenses are not covered.$d$),

  ('bleequp-rover-zeiss-lens', $d$ZEISS swappable replacement lens for BleeqUp Rover AI sports glasses. UV400 protection with ZEISS optics.

### Compatibility
- Fits BleeqUp Rover only
- Ranger lenses and Rover lenses are not interchangeable

### Warranty
BleeqUp's warranty does not cover lenses.$d$),

  ('bleequp-rover-polarized-lens', $d$Polarized swappable replacement lens for BleeqUp Rover AI sports glasses, to cut glare off water, wet roads and car windows. UV400 protection.

### Compatibility
- Fits BleeqUp Rover only
- Ranger lenses and Rover lenses are not interchangeable

### Warranty
BleeqUp's warranty does not cover lenses.$d$),

  ('bleequp-rover-photochromic-lens', $d$Photochromic swappable replacement lens for BleeqUp Rover AI sports glasses: clear in low light, darkening automatically in sunlight, so one lens covers dawn rides, tunnels and full sun. UV400 protection.

### Compatibility
- Fits BleeqUp Rover only
- Ranger lenses and Rover lenses are not interchangeable

### Warranty
BleeqUp's warranty does not cover lenses.$d$),

  ('zeiss-blue-lens', $d$ZEISS Blue swappable lens for BleeqUp Ranger: ZEISS optics for sharper edges, with coatings that resist scratches, water and oil.

### Specs
- 18–43% light transmission, UV400
- Scratch-resistant, water-repellent and oil-repellent coatings

### Compatibility
- Fits BleeqUp Ranger only; does not fit Rover

### Warranty
BleeqUp's warranty does not cover lenses.$d$),

  ('bleequp-photochromic-black-red', $d$Photochromic swappable lens for BleeqUp Ranger that is nearly clear indoors and darkens to a black-red tint in sunlight.

### Specs
- 43–80% light transmission when clear, 18–43% when fully darkened
- UV400, scratch-resistant and water-resistant

### Compatibility
- Fits BleeqUp Ranger only; does not fit Rover

### Warranty
BleeqUp's warranty does not cover lenses.$d$),

  ('bleequp-orange-red-lens', $d$Orange Red swappable lens for BleeqUp Ranger, the standard tint for everyday sport and outdoor use.

### Specs
- 18–43% light transmission, UV400
- Scratch-resistant and water-resistant

### Compatibility
- Fits BleeqUp Ranger only; does not fit Rover

### Warranty
BleeqUp's warranty does not cover lenses.$d$),

  ('bleequp-rover-power-plus', $d$BleeqUp Rover Power Plus is a 1600 mAh battery that mounts on the back of your helmet and extends Rover to about 5 hours of recording or 48 hours of audio in total. Rover only.

### Specs
- 1600 mAh, 42 g, 59 × 48 × 13 mm
- IP56 water and dust resistance
- 5 V DC, 1 A input and output
- Approved for carry-on luggage on flights

### How to use it
- Mount it at the centre rear of the helmet with the port on the right, near your ear
- It goes to standby after 15 minutes unused; press the button once to wake it

### Does it work with Ranger?
No. Rover Power Plus is only compatible with Rover. Ranger needs the Ranger Power Plus.$d$),

  ('bleequp-power-plus', $d$BleeqUp Ranger Power Plus is a 1600 mAh battery that mounts on the back of your helmet and extends Ranger from about 1 hour to about 5 hours of recording, or to 48 hours of audio. Ranger only.

### Specs
- 1600 mAh, 42 g, 59 × 48 × 13 mm
- IP56 water and dust resistance
- 5 V DC, 1 A input and output
- Approved for carry-on luggage on flights

### How to use it
- Connect it to Ranger with the Magnetic Charging Wire on the temple charging port
- Mount it at the centre rear of the helmet with the port on the right, near your ear
- It goes to standby after 15 minutes unused; press the button once to wake it

### Does it work with Rover?
No. Ranger Power Plus is only compatible with Ranger. Rover needs the Rover Power Plus.$d$),

  ('bleequp-bluetooth-controller', $d$BleeqUp Bluetooth Controller is a handlebar remote for BleeqUp glasses: start and stop video, take photos and manage calls without taking a hand off the bars. Works with Ranger and Rover.

### Specs
- Bluetooth 5.3 (BLE)
- CR2032 coin cell, about 5 months at 10–15 uses a week
- IP67, 18 g, 55 × 31 × 17 mm
- Handlebar mount
- Powers off after 2 minutes disconnected

### Does it work with both Ranger and Rover?
Yes. The same controller pairs with Ranger and Rover.$d$),

  ('bleequp-magnetic-charging-wire', $d$Magnetic charging cable for BleeqUp Ranger. It snaps onto the right temple to charge the glasses, and connects Ranger to the Ranger Power Plus while riding.

### Compatibility
- Fits BleeqUp Ranger only
- Rover uses its own Rover magnetic charging cable, included in the Rover box$d$),

  ('bleequp-prescription-service', $d$Prescription lenses made for the BleeqUp Ranger prescription (RX) insert, which comes free with every Ranger. Send your prescription and BleeqUp makes single-vision lenses to fit.

### Supported prescriptions
- Single vision only (no bifocal or progressive)
- Sphere: −20.00 to +12.00
- Cylinder: −6.00 to +6.00, axis 0–180°
- Pupillary distance: 35–79 mm, or 17.5–40 mm per eye

### How long does it take?
BleeqUp makes the lenses in about 7 business days after your prescription is confirmed, then they ship.

### Does it work with Rover?
No. Rover has its own prescription insert and lenses; Ranger RX lenses do not fit Rover.$d$)

) as v(slug, description)
where p.slug = v.slug;
