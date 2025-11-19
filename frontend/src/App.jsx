import { useMemo, useRef, useState } from "react";
import BathroomScene from "./BathroomScene";
import "./App.css";

const catalog = [
    {
        name: "Waschtische",
        items: [
            { name: "Waschtisch 80 cm", size: "800 × 480 × 120 mm" },
            { name: "Aufsatzwaschbecken", size: "420 × 420 × 140 mm" },
        ],
    },
    {
        name: "WCs",
        items: [
            { name: "Wand-WC", size: "360 × 540 × 365 mm" },
            { name: "Stand-WC", size: "380 × 650 × 400 mm" },
        ],
    },
    {
        name: "Duschen",
        items: [
            { name: "Walk-In Dusche", size: "1200 × 900 × 2100 mm" },
            { name: "Duschkabine", size: "900 × 900 × 2000 mm" },
        ],
    },
    {
        name: "Badewannen",
        items: [
            { name: "Freistehende Wanne", size: "1700 × 750 × 580 mm" },
            { name: "Eckbadewanne", size: "1450 × 1450 × 570 mm" },
        ],
    },
    {
        name: "Möbel",
        items: [
            { name: "Unterschrank", size: "800 × 500 × 480 mm" },
            { name: "Spiegelschrank", size: "800 × 140 × 700 mm" },
        ],
    },
    {
        name: "Deko",
        items: [
            { name: "Pflanze", size: "250 × 250 × 800 mm" },
            { name: "Handtuchhalter", size: "600 × 80 × 80 mm" },
        ],
    },
    {
        name: "Materialien",
        items: [
            { name: "Fliesen Beton", size: "600 × 600 mm" },
            { name: "Eiche Natur", size: "200 × 1200 mm" },
        ],
    },
];

const viewModes = ["Orbit", "First-Person", "2D-Grundriss"];

function App() {
    const [room, setRoom] = useState({
        width: 4,
        depth: 3,
        height: 2.5,
    });
    const [selectedItem, setSelectedItem] = useState(catalog[0].items[0]);
    const [transform, setTransform] = useState({
        position: { x: 0, y: 0.25, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { x: 0.8, y: 0.8, z: 0.8 },
        material: "Neutral",
    });
    const [activeView, setActiveView] = useState(viewModes[0]);
    const [gridEnabled, setGridEnabled] = useState(true);

    const sceneRef = useRef(null);

    const handleRoomChange = (field) => (event) => {
        const value = parseFloat(event.target.value) || 0;
        setRoom((prev) => ({ ...prev, [field]: value }));
    };

    const handleTransformChange = (section, field) => (event) => {
        const value = parseFloat(event.target.value) || 0;
        setTransform((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleMaterialChange = (event) => {
        setTransform((prev) => ({ ...prev, material: event.target.value }));
    };

    const toolbarButtons = useMemo(
        () => [
            { label: "Türen & Fenster", action: "add-openings" },
            { label: "Raster", action: "toggle-grid" },
            { label: "Screenshot", action: "capture" },
            { label: "Undo", action: "undo" },
            { label: "Redo", action: "redo" },
        ],
        [],
    );

    const handleToolbarAction = async (action) => {
        switch (action) {
            case "toggle-grid":
                setGridEnabled((prev) => !prev);
                break;
            case "capture": {
                const dataUrl = sceneRef.current?.capture?.();
                if (!dataUrl) return;
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "badplanung.png";
                link.click();
                break;
            }
            case "undo":
            case "redo":
            case "add-openings":
            default:
                // placeholders for future interactions
                break;
        }
    };

    return (
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <p className="eyebrow">Badplaner</p>
                    <h1>3D Badrenderer</h1>
                </div>
                <div className="room-controls">
                    <div className="field-group">
                        <label>Breite</label>
                        <input
                            type="number"
                            step="0.1"
                            value={room.width}
                            onChange={handleRoomChange("width")}
                        />
                        <span className="unit">m</span>
                    </div>
                    <div className="field-group">
                        <label>Tiefe</label>
                        <input
                            type="number"
                            step="0.1"
                            value={room.depth}
                            onChange={handleRoomChange("depth")}
                        />
                        <span className="unit">m</span>
                    </div>
                    <div className="field-group">
                        <label>Höhe</label>
                        <input
                            type="number"
                            step="0.1"
                            value={room.height}
                            onChange={handleRoomChange("height")}
                        />
                        <span className="unit">m</span>
                    </div>
                    <button className="primary-action">Maße anwenden</button>
                </div>
                <div className="toolbar">
                    {toolbarButtons.map((button) => (
                        <button
                            key={button.action}
                            className="ghost-button"
                            onClick={() => handleToolbarAction(button.action)}
                        >
                            {button.label}
                        </button>
                    ))}
                    <div className="view-toggle">
                        {viewModes.map((mode) => (
                            <button
                                key={mode}
                                className={mode === activeView ? "pill active" : "pill"}
                                onClick={() => setActiveView(mode)}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="workspace">
                <aside className="sidebar">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">Katalog</p>
                            <h2>Einrichtung</h2>
                        </div>
                        <input className="search" placeholder="Suche" />
                    </div>
                    <div className="catalog">
                        {catalog.map((category) => (
                            <section key={category.name} className="category">
                                <div className="category-head">
                                    <h3>{category.name}</h3>
                                    <span className="badge">{category.items.length}</span>
                                </div>
                                <div className="tiles">
                                    {category.items.map((item) => (
                                        <button
                                            key={item.name}
                                            className={
                                                selectedItem?.name === item.name
                                                    ? "tile selected"
                                                    : "tile"
                                            }
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <div className="thumb" aria-hidden>
                                                <span>{item.name.slice(0, 1)}</span>
                                            </div>
                                            <div>
                                                <p className="tile-title">{item.name}</p>
                                                <p className="tile-subtitle">{item.size}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </aside>

                <section className="viewport">
                    <div className="viewport-header">
                        <div>
                            <p className="eyebrow">Hauptansicht</p>
                            <h2>3D-Renderer</h2>
                        </div>
                        <div className="status-pills">
                            <span className="status">{activeView}</span>
                            <span className="status subtle">Raster {gridEnabled ? "an" : "aus"}</span>
                        </div>
                    </div>
                    <div className="renderer-shell">
                        <BathroomScene
                            ref={sceneRef}
                            roomWidth={room.width}
                            roomDepth={room.depth}
                            roomHeight={room.height}
                            viewMode={activeView}
                            showGrid={gridEnabled}
                        />
                    </div>
                </section>

                <aside className="sidebar properties">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">Eigenschaften</p>
                            <h2>{selectedItem?.name ?? "Kein Objekt"}</h2>
                            <p className="muted">{selectedItem?.size}</p>
                        </div>
                        <button className="ghost-button danger">Löschen</button>
                    </div>

                    <div className="property-grid">
                        <h3>Position</h3>
                        <div className="triple">
                            <label>
                                X
                                <input
                                    type="number"
                                    step="0.1"
                                    value={transform.position.x}
                                    onChange={handleTransformChange("position", "x")}
                                />
                            </label>
                            <label>
                                Y
                                <input
                                    type="number"
                                    step="0.1"
                                    value={transform.position.y}
                                    onChange={handleTransformChange("position", "y")}
                                />
                            </label>
                            <label>
                                Z
                                <input
                                    type="number"
                                    step="0.1"
                                    value={transform.position.z}
                                    onChange={handleTransformChange("position", "z")}
                                />
                            </label>
                        </div>

                        <h3>Rotation</h3>
                        <div className="triple">
                            <label>
                                X
                                <input
                                    type="number"
                                    step="1"
                                    value={transform.rotation.x}
                                    onChange={handleTransformChange("rotation", "x")}
                                />
                            </label>
                            <label>
                                Y
                                <input
                                    type="number"
                                    step="1"
                                    value={transform.rotation.y}
                                    onChange={handleTransformChange("rotation", "y")}
                                />
                            </label>
                            <label>
                                Z
                                <input
                                    type="number"
                                    step="1"
                                    value={transform.rotation.z}
                                    onChange={handleTransformChange("rotation", "z")}
                                />
                            </label>
                        </div>

                        <h3>Größe</h3>
                        <div className="triple">
                            <label>
                                X
                                <input
                                    type="number"
                                    step="0.1"
                                    value={transform.size.x}
                                    onChange={handleTransformChange("size", "x")}
                                />
                            </label>
                            <label>
                                Y
                                <input
                                    type="number"
                                    step="0.1"
                                    value={transform.size.y}
                                    onChange={handleTransformChange("size", "y")}
                                />
                            </label>
                            <label>
                                Z
                                <input
                                    type="number"
                                    step="0.1"
                                    value={transform.size.z}
                                    onChange={handleTransformChange("size", "z")}
                                />
                            </label>
                        </div>

                        <h3>Material</h3>
                        <select value={transform.material} onChange={handleMaterialChange}>
                            <option>Neutral</option>
                            <option>Beton</option>
                            <option>Eiche</option>
                            <option>Marmor</option>
                        </select>

                        <button className="primary-action block">Änderungen übernehmen</button>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default App;
