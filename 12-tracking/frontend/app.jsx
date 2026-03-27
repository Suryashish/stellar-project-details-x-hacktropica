import React, { useState } from "react";
import { checkConnection, createShipment, updateStatus, addCheckpoint, markDelivered, getShipment, listShipments, getShipmentCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "ship1",
        sender: "",
        receiverName: "John Doe",
        origin: "New York",
        destination: "Los Angeles",
        weight: "500",
        newStatus: "in_transit",
        location: "",
        notes: "",
        timestamp: String(nowTs()),
    });
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

    const onCreateShipment = () => runAction(async () => createShipment({
        id: form.id.trim(),
        sender: form.sender.trim(),
        receiverName: form.receiverName.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        weight: form.weight.trim(),
    }));

    const onUpdateStatus = () => runAction(async () => updateStatus({
        id: form.id.trim(),
        sender: form.sender.trim(),
        newStatus: form.newStatus.trim(),
        location: form.location.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onAddCheckpoint = () => runAction(async () => addCheckpoint({
        id: form.id.trim(),
        sender: form.sender.trim(),
        location: form.location.trim(),
        notes: form.notes.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onMarkDelivered = () => runAction(async () => markDelivered({
        id: form.id.trim(),
        sender: form.sender.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onGetShipment = () => runAction(async () => getShipment(form.id.trim()));
    const onListShipments = () => runAction(async () => listShipments());
    const onGetCount = () => runAction(async () => {
        const value = await getShipmentCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 12</p>
                <h1>Shipment Tracking System</h1>
                <p className="subtitle">Create shipments, update status, add checkpoints, and track deliveries on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Shipment count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Create Shipment</h2>

                <label htmlFor="shipmentId">Shipment ID (Symbol)</label>
                <input id="shipmentId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="sender">Sender Address</label>
                <input id="sender" name="sender" value={form.sender} onChange={setField} placeholder="G..." />

                <label htmlFor="receiverName">Receiver Name</label>
                <input id="receiverName" name="receiverName" value={form.receiverName} onChange={setField} />

                <label htmlFor="origin">Origin</label>
                <input id="origin" name="origin" value={form.origin} onChange={setField} />

                <label htmlFor="destination">Destination</label>
                <input id="destination" name="destination" value={form.destination} onChange={setField} />

                <label htmlFor="weight">Weight (u32)</label>
                <input id="weight" name="weight" value={form.weight} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateShipment} disabled={isBusy}>Create Shipment</button>
                </div>
            </section>

            <section className="panel">
                <h2>Update Tracking</h2>

                <label htmlFor="newStatus">Status</label>
                <select id="newStatus" name="newStatus" value={form.newStatus} onChange={setField}>
                    <option value="created">created</option>
                    <option value="in_transit">in_transit</option>
                    <option value="out_for_delivery">out_for_delivery</option>
                    <option value="delivered">delivered</option>
                </select>

                <label htmlFor="location">Current Location</label>
                <input id="location" name="location" value={form.location} onChange={setField} />

                <label htmlFor="notes">Checkpoint Notes</label>
                <textarea id="notes" name="notes" rows="3" value={form.notes} onChange={setField} />

                <label htmlFor="timestamp">Timestamp (u64)</label>
                <input id="timestamp" name="timestamp" value={form.timestamp} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onUpdateStatus} disabled={isBusy}>Update Status</button>
                    <button type="button" onClick={onAddCheckpoint} disabled={isBusy}>Add Checkpoint</button>
                    <button type="button" onClick={onMarkDelivered} disabled={isBusy}>Mark Delivered</button>
                </div>
            </section>

            <section className="panel">
                <h2>Query</h2>
                <div className="actions">
                    <button type="button" onClick={onGetShipment} disabled={isBusy}>Get Shipment</button>
                    <button type="button" onClick={onListShipments} disabled={isBusy}>List Shipments</button>
                    <button type="button" onClick={onGetCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
