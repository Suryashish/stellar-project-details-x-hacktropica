import React, { useState } from "react";
import { checkConnection, recordMetric, updateMetric, recordEvent, getMetric, listMetrics, getCategoryTotal, getMetricCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "metric1",
        reporter: "",
        metricName: "page_views",
        value: "100",
        newValue: "200",
        category: "traffic",
        eventType: "info",
        description: "System event recorded",
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

    const onRecordMetric = () => runAction(async () => recordMetric({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
        metricName: form.metricName.trim(),
        value: form.value.trim(),
        category: form.category.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onUpdateMetric = () => runAction(async () => updateMetric({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
        newValue: form.newValue.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onRecordEvent = () => runAction(async () => recordEvent({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
        eventType: form.eventType.trim(),
        description: form.description.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onGetMetric = () => runAction(async () => getMetric(form.id.trim()));
    const onListMetrics = () => runAction(async () => listMetrics());
    const onGetCategoryTotal = () => runAction(async () => {
        const total = await getCategoryTotal(form.category.trim());
        return { category: form.category.trim(), total };
    });
    const onGetCount = () => runAction(async () => {
        const value = await getMetricCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 13</p>
                <h1>Dashboard and Analytics</h1>
                <p className="subtitle">Record metrics, track events, and query analytics data on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Metric count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Record Metric</h2>

                <label htmlFor="metricId">Metric ID (Symbol)</label>
                <input id="metricId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="reporter">Reporter Address</label>
                <input id="reporter" name="reporter" value={form.reporter} onChange={setField} placeholder="G..." />

                <label htmlFor="metricName">Metric Name</label>
                <input id="metricName" name="metricName" value={form.metricName} onChange={setField} />

                <label htmlFor="value">Value (i128)</label>
                <input id="value" name="value" value={form.value} onChange={setField} type="number" />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} />

                <label htmlFor="timestamp">Timestamp (u64)</label>
                <input id="timestamp" name="timestamp" value={form.timestamp} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onRecordMetric} disabled={isBusy}>Record Metric</button>
                </div>
            </section>

            <section className="panel">
                <h2>Update Metric</h2>

                <label htmlFor="newValue">New Value (i128)</label>
                <input id="newValue" name="newValue" value={form.newValue} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onUpdateMetric} disabled={isBusy}>Update Metric</button>
                </div>
            </section>

            <section className="panel">
                <h2>Record Event</h2>

                <label htmlFor="eventType">Event Type (Symbol)</label>
                <input id="eventType" name="eventType" value={form.eventType} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onRecordEvent} disabled={isBusy}>Record Event</button>
                </div>
            </section>

            <section className="panel">
                <h2>Query</h2>
                <div className="actions">
                    <button type="button" onClick={onGetMetric} disabled={isBusy}>Get Metric</button>
                    <button type="button" onClick={onListMetrics} disabled={isBusy}>List Metrics</button>
                    <button type="button" onClick={onGetCategoryTotal} disabled={isBusy}>Category Total</button>
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
