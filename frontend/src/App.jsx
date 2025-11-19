import { useState } from "react";
import BathroomScene from "./BathroomScene";

function App() {
    const [room, setRoom] = useState({
        width: 4,
        depth: 3,
        height: 2.5,
    });

    const handleChange = (field) => (event) => {
        const value = parseFloat(event.target.value) || 0;
        setRoom((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div
                style={{
                    padding: "8px 12px",
                    background: "#f0f0f0",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    fontFamily: "sans-serif",
                }}
            >
                <strong>Raumgröße:</strong>

                <label>
                    Breite (m):{" "}
                    <input
                        type="number"
                        step="0.1"
                        value={room.width}
                        onChange={handleChange("width")}
                        style={{ width: "70px" }}
                    />
                </label>

                <label>
                    Tiefe (m):{" "}
                    <input
                        type="number"
                        step="0.1"
                        value={room.depth}
                        onChange={handleChange("depth")}
                        style={{ width: "70px" }}
                    />
                </label>

                <label>
                    Höhe (m):{" "}
                    <input
                        type="number"
                        step="0.1"
                        value={room.height}
                        onChange={handleChange("height")}
                        style={{ width: "70px" }}
                    />
                </label>
            </div>

            <div style={{ flex: 1 }}>
                <BathroomScene
                    roomWidth={room.width}
                    roomDepth={room.depth}
                    roomHeight={room.height}
                />
            </div>
        </div>
    );
}

export default App;
