import BorderGlow from "./BorderGlow";

export default function BorderGlowPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1.0}
          coneSpread={25}
          animated={false}
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
        >
          <div style={{ padding: "2em" }}>
            <h2 className="text-xl font-bold text-white mb-2">Your Content Here</h2>
            <p className="text-sm text-white">Hover near the edges to see the glow.</p>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
