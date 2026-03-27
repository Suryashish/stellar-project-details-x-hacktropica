import React, { useState } from "react";
import { checkConnection, createAlert, acknowledgeAlert, resolveAlert, escalateAlert, getAlert, listAlerts, getActiveCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "alert1",
        creator: "",
        title: "Road Closure",
        description: "Main street blocked due to construction",
        alertType: "traffic",
        latitude: "407128000",
        longitude: "-740060000",
        radius: "500",
        severity: "3",
        expiresAt: String(nowTs() + 86400),
        responder: "",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [activeCount, setActiveCount] = useState("-");

    const setField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const runAction = async (action) => {
        setIsBusy(true);
        try {
            const result = await action();
            setOutput(toOutput(result ?? "No data found"));
        } catch (error) {
            setOutput(error?.message || String(error));
        } finally {
            setIsBusy(false);
        }
    };

    const onConnect = () => runAction(async () => {
        const user = await checkConnection();
        const next = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(next);
        return next;
    });

    const onCreateAlert = () => runAction(async () =>
        createAlert({
            id: form.id.trim(),
            creator: form.creator.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            alertType: form.alertType.trim(),
            latitude: form.latitude.trim(),
            longitude: form.longitude.trim(),
            radius: form.radius.trim(),
            severity: form.severity.trim(),
            expiresAt: form.expiresAt.trim(),
        })
    );

    const onAcknowledge = () => runAction(async () =>
        acknowledgeAlert({
            id: form.id.trim(),
            responder: form.responder.trim() || form.creator.trim(),
        })
    );

    const onResolve = () => runAction(async () =>
        resolveAlert({
            id: form.id.trim(),
            creator: form.creator.trim(),
        })
    );

    const onEscalate = () => runAction(async () =>
        escalateAlert({
            id: form.id.trim(),
            creator: form.creator.trim(),
        })
    );

    const onGetAlert = () => runAction(async () => getAlert(form.id.trim()));

    const onListAlerts = () => runAction(async () => listAlerts());

    const onGetActiveCount = () => runAction(async () => {
        const value = await getActiveCount();
        setActiveCount(String(value));
        return { activeAlerts: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 23</p>
                <h1>Geo-based Alert System</h1>
                <p className="subtitle">
                    Create location-based alerts, acknowledge, escalate, and resolve them.
                    Coordinates use i128 scaled by 1e7 (e.g., 40.7128 N = 407128000).
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Active alerts: {activeCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="id">Alert ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="creator">Creator Address</label>
                <input id="creator" name="creator" value={form.creator} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <input id="description" name="description" value={form.description} onChange={setField} />

                <label htmlFor="alertType">Alert Type (weather/traffic/emergency/info)</label>
                <input id="alertType" name="alertType" value={form.alertType} onChange={setField} />

                <label htmlFor="latitude">Latitude (i128, scaled by 1e7)</label>
                <input id="latitude" name="latitude" value={form.latitude} onChange={setField} type="number" />

                <label htmlFor="longitude">Longitude (i128, scaled by 1e7)</label>
                <input id="longitude" name="longitude" value={form.longitude} onChange={setField} type="number" />

                <label htmlFor="radius">Radius (meters)</label>
                <input id="radius" name="radius" value={form.radius} onChange={setField} type="number" />

                <label htmlFor="severity">Severity (0-5)</label>
                <input id="severity" name="severity" value={form.severity} onChange={setField} type="number" />

                <label htmlFor="expiresAt">Expires At (u64 timestamp)</label>
                <input id="expiresAt" name="expiresAt" value={form.expiresAt} onChange={setField} type="number" />

                <label htmlFor="responder">Responder Address (for acknowledge)</label>
                <input id="responder" name="responder" value={form.responder} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onCreateAlert} disabled={isBusy}>Create Alert</button>
                    <button type="button" onClick={onAcknowledge} disabled={isBusy}>Acknowledge</button>
                    <button type="button" onClick={onEscalate} disabled={isBusy}>Escalate</button>
                    <button type="button" onClick={onResolve} disabled={isBusy}>Resolve</button>
                    <button type="button" onClick={onGetAlert} disabled={isBusy}>Get Alert</button>
                    <button type="button" onClick={onListAlerts} disabled={isBusy}>List Alerts</button>
                    <button type="button" onClick={onGetActiveCount} disabled={isBusy}>Active Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
