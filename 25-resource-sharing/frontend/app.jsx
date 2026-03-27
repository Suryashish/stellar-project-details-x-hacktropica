import React, { useState } from "react";
import { checkConnection, listResource, borrowResource, returnResource, rateTransaction, getResource, listResources, getAvailableCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "res1",
        owner: "",
        name: "Power Drill",
        description: "Cordless power drill, good condition",
        category: "tools",
        dailyRate: "50000000",
        depositRequired: "200000000",
        borrower: "",
        startDate: String(nowTs()),
        endDate: String(nowTs() + 86400 * 3),
        conditionNotes: "Returned in good condition",
        rating: "5",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [availableCount, setAvailableCount] = useState("-");

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

    const onListResource = () => runAction(async () =>
        listResource({
            id: form.id.trim(),
            owner: form.owner.trim(),
            name: form.name.trim(),
            description: form.description.trim(),
            category: form.category.trim(),
            dailyRate: form.dailyRate.trim(),
            depositRequired: form.depositRequired.trim(),
        })
    );

    const onBorrow = () => runAction(async () =>
        borrowResource({
            id: form.id.trim(),
            borrower: form.borrower.trim(),
            startDate: form.startDate.trim(),
            endDate: form.endDate.trim(),
        })
    );

    const onReturn = () => runAction(async () =>
        returnResource({
            id: form.id.trim(),
            borrower: form.borrower.trim(),
            conditionNotes: form.conditionNotes.trim(),
        })
    );

    const onRate = () => runAction(async () =>
        rateTransaction({
            id: form.id.trim(),
            rater: form.borrower.trim() || form.owner.trim(),
            rating: form.rating.trim(),
        })
    );

    const onGetResource = () => runAction(async () => getResource(form.id.trim()));

    const onListResources = () => runAction(async () => listResources());

    const onGetAvailable = () => runAction(async () => {
        const value = await getAvailableCount();
        setAvailableCount(String(value));
        return { available: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 25</p>
                <h1>Resource Sharing Platform</h1>
                <p className="subtitle">
                    List resources for lending, borrow and return items, and rate transactions.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Available resources: {availableCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="id">Resource ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Resource Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="description">Description</label>
                <input id="description" name="description" value={form.description} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="tools/electronics/books" />

                <label htmlFor="dailyRate">Daily Rate (i128 stroops)</label>
                <input id="dailyRate" name="dailyRate" value={form.dailyRate} onChange={setField} type="number" />

                <label htmlFor="depositRequired">Deposit Required (i128 stroops)</label>
                <input id="depositRequired" name="depositRequired" value={form.depositRequired} onChange={setField} type="number" />

                <label htmlFor="borrower">Borrower Address</label>
                <input id="borrower" name="borrower" value={form.borrower} onChange={setField} placeholder="G..." />

                <label htmlFor="startDate">Start Date (u64 timestamp)</label>
                <input id="startDate" name="startDate" value={form.startDate} onChange={setField} type="number" />

                <label htmlFor="endDate">End Date (u64 timestamp)</label>
                <input id="endDate" name="endDate" value={form.endDate} onChange={setField} type="number" />

                <label htmlFor="conditionNotes">Condition Notes (for return)</label>
                <input id="conditionNotes" name="conditionNotes" value={form.conditionNotes} onChange={setField} />

                <label htmlFor="rating">Rating (1-5)</label>
                <input id="rating" name="rating" value={form.rating} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onListResource} disabled={isBusy}>List Resource</button>
                    <button type="button" onClick={onBorrow} disabled={isBusy}>Borrow</button>
                    <button type="button" onClick={onReturn} disabled={isBusy}>Return</button>
                    <button type="button" onClick={onRate} disabled={isBusy}>Rate</button>
                    <button type="button" onClick={onGetResource} disabled={isBusy}>Get Resource</button>
                    <button type="button" onClick={onListResources} disabled={isBusy}>List Resources</button>
                    <button type="button" onClick={onGetAvailable} disabled={isBusy}>Available Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
