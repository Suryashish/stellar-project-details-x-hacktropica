import React, { useState } from "react";
import { checkConnection, registerResource, reserveResource, releaseResource, checkAvailability, getResource, listResources, getCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const initialForm = () => ({
    id: "res1",
    owner: "",
    name: "Conference Room A",
    resourceType: "room",
    capacity: "10",
    location: "Building 1, Floor 2",
    reserver: "",
    startTime: String(nowTs()),
    endTime: String(nowTs() + 3600),
});

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState(initialForm);
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [countValue, setCountValue] = useState("-");

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

    const onRegister = () => runAction(async () => registerResource({
        id: form.id.trim(),
        owner: form.owner.trim(),
        name: form.name.trim(),
        resourceType: form.resourceType.trim(),
        capacity: form.capacity.trim(),
        location: form.location.trim(),
    }));

    const onReserve = () => runAction(async () => reserveResource({
        id: form.id.trim(),
        reserver: form.reserver.trim() || form.owner.trim(),
        startTime: Number(form.startTime || nowTs()),
        endTime: Number(form.endTime || nowTs() + 3600),
    }));

    const onRelease = () => runAction(async () => releaseResource({
        id: form.id.trim(),
        reserver: form.reserver.trim() || form.owner.trim(),
    }));

    const onCheckAvailability = () => runAction(async () => {
        const available = await checkAvailability(form.id.trim());
        return { resourceId: form.id.trim(), available };
    });

    const onGetResource = () => runAction(async () => getResource(form.id.trim()));

    const onList = () => runAction(async () => listResources());

    const onCount = () => runAction(async () => {
        const value = await getCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 2</p>
                <h1>Resource Availability System</h1>
                <p className="subtitle">
                    Register resources, make reservations with time slots, check availability, and release reservations.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Registered resources: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Register Resource</h2>

                <label htmlFor="entryId">Resource ID (Symbol)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Resource Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="resourceType">Resource Type (Symbol)</label>
                <input id="resourceType" name="resourceType" value={form.resourceType} onChange={setField} placeholder="room, vehicle, equipment..." />

                <label htmlFor="capacity">Capacity</label>
                <input id="capacity" name="capacity" value={form.capacity} onChange={setField} type="number" />

                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={form.location} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onRegister} disabled={isBusy}>Register Resource</button>
                    <button type="button" onClick={onGetResource} disabled={isBusy}>Get Resource</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List All Resources</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel">
                <h2>Reservation Management</h2>

                <label htmlFor="reserver">Reserver Address</label>
                <input id="reserver" name="reserver" value={form.reserver} onChange={setField} placeholder="G... (defaults to owner)" />

                <label htmlFor="startTime">Start Time (u64 timestamp)</label>
                <input id="startTime" name="startTime" value={form.startTime} onChange={setField} type="number" />

                <label htmlFor="endTime">End Time (u64 timestamp)</label>
                <input id="endTime" name="endTime" value={form.endTime} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onReserve} disabled={isBusy}>Reserve Resource</button>
                    <button type="button" onClick={onRelease} disabled={isBusy}>Release Resource</button>
                    <button type="button" onClick={onCheckAvailability} disabled={isBusy}>Check Availability</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
