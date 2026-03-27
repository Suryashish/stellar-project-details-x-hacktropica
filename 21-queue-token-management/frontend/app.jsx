import React, { useState } from "react";
import { checkConnection, createQueue, takeToken, callNext, skipToken, getQueue, listQueues, getCurrentWait } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "queue1",
        admin: "",
        queueName: "Main Queue",
        maxCapacity: "50",
        customer: "",
        tokenNumber: "1",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [waitCount, setWaitCount] = useState("-");

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

    const onCreateQueue = () => runAction(async () =>
        createQueue({
            id: form.id.trim(),
            admin: form.admin.trim(),
            queueName: form.queueName.trim(),
            maxCapacity: form.maxCapacity.trim(),
        })
    );

    const onTakeToken = () => runAction(async () =>
        takeToken({
            queueId: form.id.trim(),
            customer: form.customer.trim(),
        })
    );

    const onCallNext = () => runAction(async () =>
        callNext({
            queueId: form.id.trim(),
            admin: form.admin.trim(),
        })
    );

    const onSkipToken = () => runAction(async () =>
        skipToken({
            queueId: form.id.trim(),
            admin: form.admin.trim(),
            tokenNumber: form.tokenNumber.trim(),
        })
    );

    const onGetQueue = () => runAction(async () => getQueue(form.id.trim()));

    const onListQueues = () => runAction(async () => listQueues());

    const onGetWait = () => runAction(async () => {
        const value = await getCurrentWait(form.id.trim());
        setWaitCount(String(value));
        return { waiting: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 21</p>
                <h1>Queue / Token Management System</h1>
                <p className="subtitle">
                    Create queues, issue tokens, call next in line, and skip tokens.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Current wait: {waitCount} tokens</p>
            </section>

            <section className="panel">
                <label htmlFor="id">Queue ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="admin">Admin Address</label>
                <input id="admin" name="admin" value={form.admin} onChange={setField} placeholder="G..." />

                <label htmlFor="queueName">Queue Name</label>
                <input id="queueName" name="queueName" value={form.queueName} onChange={setField} />

                <label htmlFor="maxCapacity">Max Capacity</label>
                <input id="maxCapacity" name="maxCapacity" value={form.maxCapacity} onChange={setField} type="number" />

                <label htmlFor="customer">Customer Address</label>
                <input id="customer" name="customer" value={form.customer} onChange={setField} placeholder="G..." />

                <label htmlFor="tokenNumber">Token Number (for skip)</label>
                <input id="tokenNumber" name="tokenNumber" value={form.tokenNumber} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateQueue} disabled={isBusy}>Create Queue</button>
                    <button type="button" onClick={onTakeToken} disabled={isBusy}>Take Token</button>
                    <button type="button" onClick={onCallNext} disabled={isBusy}>Call Next</button>
                    <button type="button" onClick={onSkipToken} disabled={isBusy}>Skip Token</button>
                    <button type="button" onClick={onGetQueue} disabled={isBusy}>Get Queue</button>
                    <button type="button" onClick={onListQueues} disabled={isBusy}>List Queues</button>
                    <button type="button" onClick={onGetWait} disabled={isBusy}>Get Wait Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
