import React, { useState } from "react";
import { checkConnection, uploadEntry, shareEntry, downloadEntry, listIds, getCount } from "../lib.js/stellar.js";

const meta = {
    number: 18,
    title: "Document Sharing System",
    style: "file-explorer",
    label: "document",
    writeAction: "upload",
    updateAction: "share",
    readAction: "download",
};

const nowTs = () => Math.floor(Date.now() / 1000);

const initialForm = () => ({
    id: `${meta.label}1`,
    owner: "",
    title: `Sample ${meta.label}`,
    state: "open",
    amount: "0",
    updatedAt: String(nowTs()),
    notes: "Created from frontend",
});

const toOutput = (value) => {
    if (typeof value === "string") {
        return value;
    }
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

    const payload = () => ({
        id: form.id.trim(),
        owner: form.owner.trim(),
        title: form.title.trim(),
        notes: form.notes.trim(),
        state: form.state.trim() || "open",
        amount: form.amount.trim() || "0",
        updatedAt: Number(form.updatedAt.trim() || nowTs()),
    });

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
        const nextWalletState = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(nextWalletState);
        return nextWalletState;
    });

    const onWrite = () => runAction(async () => uploadEntry(payload()));

    const onUpdate = () => runAction(async () => {
        const next = payload();
        return shareEntry({
            id: next.id,
            state: next.state,
            notes: next.notes,
            updatedAt: next.updatedAt,
        });
    });

    const onRead = () => runAction(async () => {
        const next = payload();
        return downloadEntry(next.id);
    });

    const onList = () => runAction(async () => listIds());

    const onCount = () => runAction(async () => {
        const value = await getCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project {meta.number}</p>
                <h1>{meta.title}</h1>
                <p className="subtitle">
                    Theme: {meta.style}. Use this UI to {meta.writeAction}, {meta.updateAction}, and {meta.readAction} {meta.label} data.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Stored {meta.label} count: {countValue}</p>
            </section>

            <section className="panel">
                <label htmlFor="entryId">ID (Symbol, &lt;= 32 chars)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="state">State (Symbol)</label>
                <input id="state" name="state" value={form.state} onChange={setField} />

                <label htmlFor="amount">Amount (i128)</label>
                <input id="amount" name="amount" value={form.amount} onChange={setField} type="number" />

                <label htmlFor="updatedAt">Updated At (u64)</label>
                <input id="updatedAt" name="updatedAt" value={form.updatedAt} onChange={setField} type="number" />

                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" rows="4" value={form.notes} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onWrite} disabled={isBusy}>{meta.writeAction} {meta.label}</button>
                    <button type="button" onClick={onUpdate} disabled={isBusy}>{meta.updateAction} {meta.label}</button>
                    <button type="button" onClick={onRead} disabled={isBusy}>{meta.readAction} {meta.label}</button>
                    <button type="button" onClick={onList} disabled={isBusy}>list ids</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>get count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
