import React, { useState } from "react";
import { checkConnection, createRecord, updateRecord, archiveRecord, getRecord, listRecords, getRecordsByCategory, getCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const initialForm = () => ({
    id: "rec1",
    owner: "",
    title: "Sample Record",
    category: "general",
    description: "A new record entry",
    createdAt: String(nowTs()),
    updatedAt: String(nowTs()),
    filterCategory: "general",
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

    const onCreate = () => runAction(async () => createRecord({
        id: form.id.trim(),
        owner: form.owner.trim(),
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        createdAt: Number(form.createdAt || nowTs()),
    }));

    const onUpdate = () => runAction(async () => updateRecord({
        id: form.id.trim(),
        owner: form.owner.trim(),
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        updatedAt: Number(form.updatedAt || nowTs()),
    }));

    const onArchive = () => runAction(async () => archiveRecord({
        id: form.id.trim(),
        owner: form.owner.trim(),
    }));

    const onGet = () => runAction(async () => getRecord(form.id.trim()));

    const onList = () => runAction(async () => listRecords());

    const onFilterByCategory = () => runAction(async () => getRecordsByCategory(form.filterCategory.trim()));

    const onCount = () => runAction(async () => {
        const value = await getCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 1</p>
                <h1>Record Management System</h1>
                <p className="subtitle">
                    Create, update, archive, and search records by category on the Stellar blockchain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total records: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Record Details</h2>

                <label htmlFor="entryId">Record ID (Symbol, &lt;= 32 chars)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="general, finance, legal..." />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="4" value={form.description} onChange={setField} />

                <label htmlFor="createdAt">Created At (u64 timestamp)</label>
                <input id="createdAt" name="createdAt" value={form.createdAt} onChange={setField} type="number" />

                <label htmlFor="updatedAt">Updated At (u64 timestamp)</label>
                <input id="updatedAt" name="updatedAt" value={form.updatedAt} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreate} disabled={isBusy}>Create Record</button>
                    <button type="button" onClick={onUpdate} disabled={isBusy}>Update Record</button>
                    <button type="button" onClick={onArchive} disabled={isBusy}>Archive Record</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Record</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List All Records</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel">
                <h2>Filter by Category</h2>
                <label htmlFor="filterCategory">Category</label>
                <input id="filterCategory" name="filterCategory" value={form.filterCategory} onChange={setField} placeholder="general" />
                <div className="actions">
                    <button type="button" onClick={onFilterByCategory} disabled={isBusy}>Search by Category</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
