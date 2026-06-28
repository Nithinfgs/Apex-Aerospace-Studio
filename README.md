[README.md](https://github.com/user-attachments/files/29438452/README.md)
Apex Aerospace Studio

A premium, professional-grade aerospace engineering workspace and telemetry simulation suite. Designed with a clean engineering aesthetic inspired by SpaceX control centers, NASA technical documents, and CAD workstations.


Project Architecture

To allow immediate execution without build systems, CORS blocks, or complex setups, this application is packaged as a flat, zero-dependency bundle consisting of exactly three files:

1. index.html: The unified layout structure, navigation tab bars, blueprints, and workspace grids.
2. style.css: The design system. Includes a tailored neutral paper-texture palette, monospace typographies, custom form controls, and CSS-based layout boundaries.
3. app.js: The consolidated application logic. Combines the custom charting engines, flight dynamics physics simulator, nose cone CAD profiles, mission patch insignia generator, and DOM controllers.


How to Run

Because the application uses native browser APIs and standard script importing, it is fully portable and requires no installation or node modules.

Method A: Offline (Double-Click)
Simply double-click the index.html file in your folder to open it directly in any browser. It operates offline and bypasses browser local file CORS restrictions.

Method B: Local Server
To run the project on a local port, open your terminal in the project directory and execute a lightweight server:

Using Python:
python3 -m http.server 3000

Using Node.js:
npx serve

Once running, navigate to http://localhost:3000 in your browser.


Workspace Modules

1. Overview Dashboard
- Provides a CAD-style 2D structural blueprint highlighting the vehicle's airframe.
- Displays static Center of Gravity (CG) and Center of Pressure (CP) indicator flags.
- Tracks live platform configurations and Cesaroni motor specs.

2. Rocket Failure Explorer
- 2D Euler Integration Engine: Calculates translational flight kinematics (ax, ay) and aerodynamic forces (Thrust, Lift, Drag, Gravity).
- Attitude Rotation Math: Solves rotational dynamics including aerodynamic restoring torque (relative to CG-CP caliber spacing), aerodynamic damping torque (resisting roll/pitch angular spin), and asymmetric thrust/fin damage drag.
- Interactive Telemetry HUD: Displays G-Forces, velocities, pitch, and altitude metrics.
- Synchronized Scientific Charts: Coordinate-synced Cartesian plots mapping Altitude, Velocity, Acceleration, and Angle of Attack (AoA).
- Timeline Events: Records key events (rail exit, MECO burnout, apogee, tangled parachute lines, and soft/hard landings).

3. Nose Cone Optimization Lab
- CAD Profile Drawing: Plots precise geometries for Conical, Tangent Ogive, Von Karman (Haack series), Parabolic, and Elliptical nose cones.
- Aerodynamic Drag Predictor (Cd): Estimates skin friction and transonic/supersonic wave drag profiles based on nose fineness ratios.
- Radar Pentagon Comparison: Rates geometries across Volumetric Space, Drag Efficiency, Structural Mass, Manufacturing Simplicity, and Material Strength.
- Spec Exporter: Generates a print-ready parameter spec report of active models.

4. Mission Patch Studio
- Generates scalable SVG vector badges.
- Includes 5 themed layouts (NASA Circular, University Crest, Experimental Hexagonal, Deep Space Insignia, and Student Gear Teeth).
- Dynamically warps crew names, dates, and mission titles along curved vector SVG text paths.
- Vector Export: Supports one-click high-resolution .svg file downloads.
