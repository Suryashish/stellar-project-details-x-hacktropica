import React, { useState } from "react";
import { checkConnection, createSlot, bookSlot, cancelBooking, completeBooking, getSlot, listSlots, getSlotCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const initialForm = () => ({
    id: "slot1",
    provider: "",
    customer: "",
    serviceName: "Consultation",
    date: String(nowTs()),
    startTime: String(nowTs()),
    endTime: String(nowTs() + 3600),
    price: "1000",
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

    const onCreateSlot = () => runAction(async () => createSlot({
        id: form.id.trim(),
        provider: form.provider.trim(),
        serviceName: form.serviceName.trim(),
        date: Number(form.date || nowTs()),
        startTime: Number(form.startTime || nowTs()),
        endTime: Number(form.endTime || nowTs() + 3600),
        price: form.price.trim(),
    }));

    const onBookSlot = () => runAction(async () => bookSlot({
        id: form.id.trim(),
        customer: form.customer.trim(),
    }));

    const onCancelBooking = () => runAction(async () => cancelBooking({
        id: form.id.trim(),
        caller: form.customer.trim() || form.provider.trim(),
    }));

    const onCompleteBooking = () => runAction(async () => completeBooking({
        id: form.id.trim(),
        provider: form.provider.trim(),
    }));

    const onGetSlot = () => runAction(async () => getSlot(form.id.trim()));

    const onList = () => runAction(async () => listSlots());

    const onCount = () => runAction(async () => {
        const value = await getSlotCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 4</p>
                <h1>Booking & Reservation System</h1>
                <p className="subtitle">
                    Create service time slots, book appointments, cancel or complete bookings on the Stellar blockchain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total slots: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Create Service Slot</h2>

                <label htmlFor="entryId">Slot ID (Symbol, &lt;= 32 chars)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="provider">Provider Address</label>
                <input id="provider" name="provider" value={form.provider} onChange={setField} placeholder="G..." />

                <label htmlFor="serviceName">Service Name</label>
                <input id="serviceName" name="serviceName" value={form.serviceName} onChange={setField} />

                <label htmlFor="date">Date (u64 timestamp)</label>
                <input id="date" name="date" value={form.date} onChange={setField} type="number" />

                <label htmlFor="startTime">Start Time (u64 timestamp)</label>
                <input id="startTime" name="startTime" value={form.startTime} onChange={setField} type="number" />

                <label htmlFor="endTime">End Time (u64 timestamp)</label>
                <input id="endTime" name="endTime" value={form.endTime} onChange={setField} type="number" />

                <label htmlFor="price">Price (i128 stroops)</label>
                <input id="price" name="price" value={form.price} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateSlot} disabled={isBusy}>Create Slot</button>
                    <button type="button" onClick={onGetSlot} disabled={isBusy}>Get Slot</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List All Slots</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel">
                <h2>Booking Actions</h2>

                <label htmlFor="customer">Customer Address</label>
                <input id="customer" name="customer" value={form.customer} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onBookSlot} disabled={isBusy}>Book Slot</button>
                    <button type="button" onClick={onCancelBooking} disabled={isBusy}>Cancel Booking</button>
                    <button type="button" onClick={onCompleteBooking} disabled={isBusy}>Complete Booking</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
