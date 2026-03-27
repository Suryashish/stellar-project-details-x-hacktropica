import React, { useState } from "react";
import { checkConnection, logAction, logAccess, flagEntry, getEntry, listEntries, getEntryCount, getFlaggedCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "log1",
        actor: "",
        actionType: "update",
        target: "user_profile",
        description: "Modified user settings",
        severity: "2",
        timestamp: String(nowTs()),
        resource: "/api/data",
        accessType: "read",
        reason: "Suspicious access pattern",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [entryCount, setEntryCount] = useState("-");
    const [flaggedCount, setFlaggedCount] = useState("-");

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

    const onLogAction = () => runAction(async () =>
        logAction({
            id: form.id.trim(),
            actor: form.actor.trim(),
            actionType: form.actionType.trim(),
            target: form.target.trim(),
            description: form.description.trim(),
            severity: form.severity.trim(),
            timestamp: form.timestamp.trim(),
        })
    );

    const onLogAccess = () => runAction(async () =>
        logAccess({
            id: form.id.trim(),
            accessor: form.actor.trim(),
            resource: form.resource.trim(),
            accessType: form.accessType.trim(),
            timestamp: form.timestamp.trim(),
        })
    );

    const onFlagEntry = () => runAction(async () =>
        flagEntry({
            id: form.id.trim(),
            auditor: form.actor.trim(),
            reason: form.reason.trim(),
        })
    );

    const onGetEntry = () => runAction(async () => getEntry(form.id.trim()));

    const onListEntries = () => runAction(async () => listEntries());

    const onGetCounts = () => runAction(async () => {
        const total = await getEntryCount();
        const flagged = await getFlaggedCount();
        setEntryCount(String(total));
        setFlaggedCount(String(flagged));
        return { totalEntries: total, flaggedEntries: flagged };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 22</p>
                <h1>Audit / Log Tracking System</h1>
                <p className="subtitle">
                    Log actions, track access, flag suspicious entries, and query the audit trail.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total entries: {entryCount} | Flagged: {flaggedCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="id">Entry ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="actor">Actor / Auditor Address</label>
                <input id="actor" name="actor" value={form.actor} onChange={setField} placeholder="G..." />

                <label htmlFor="actionType">Action Type (Symbol)</label>
                <input id="actionType" name="actionType" value={form.actionType} onChange={setField} placeholder="update/delete/create" />

                <label htmlFor="target">Target</label>
                <input id="target" name="target" value={form.target} onChange={setField} />

                <label htmlFor="description">Description</label>
                <input id="description" name="description" value={form.description} onChange={setField} />

                <label htmlFor="severity">Severity (0-5)</label>
                <input id="severity" name="severity" value={form.severity} onChange={setField} type="number" />

                <label htmlFor="timestamp">Timestamp (u64)</label>
                <input id="timestamp" name="timestamp" value={form.timestamp} onChange={setField} type="number" />

                <label htmlFor="resource">Resource (for access log)</label>
                <input id="resource" name="resource" value={form.resource} onChange={setField} />

                <label htmlFor="accessType">Access Type (Symbol)</label>
                <input id="accessType" name="accessType" value={form.accessType} onChange={setField} placeholder="read/write/delete" />

                <label htmlFor="reason">Flag Reason</label>
                <input id="reason" name="reason" value={form.reason} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onLogAction} disabled={isBusy}>Log Action</button>
                    <button type="button" onClick={onLogAccess} disabled={isBusy}>Log Access</button>
                    <button type="button" onClick={onFlagEntry} disabled={isBusy}>Flag Entry</button>
                    <button type="button" onClick={onGetEntry} disabled={isBusy}>Get Entry</button>
                    <button type="button" onClick={onListEntries} disabled={isBusy}>List Entries</button>
                    <button type="button" onClick={onGetCounts} disabled={isBusy}>Get Counts</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
