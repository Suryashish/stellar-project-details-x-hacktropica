import React, { useState } from "react";
import { checkConnection, fileComplaint, assignComplaint, resolveComplaint, escalateComplaint, getComplaint, listComplaints, getComplaintCount } from "../lib.js/stellar.js";

const initialForm = () => ({
    id: "case1",
    reporter: "",
    subject: "Service Disruption",
    description: "Detailed description of the complaint or issue.",
    category: "service",
    severity: "1",
    admin: "",
    assignee: "",
    handler: "",
    resolutionNotes: "",
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

    const onFile = () => runAction(async () => fileComplaint({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        severity: form.severity.trim(),
    }));

    const onAssign = () => runAction(async () => assignComplaint({
        id: form.id.trim(),
        admin: form.admin.trim(),
        assignee: form.assignee.trim(),
    }));

    const onResolve = () => runAction(async () => resolveComplaint({
        id: form.id.trim(),
        handler: form.handler.trim(),
        resolutionNotes: form.resolutionNotes.trim(),
    }));

    const onEscalate = () => runAction(async () => escalateComplaint({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
    }));

    const onGet = () => runAction(async () => getComplaint(form.id.trim()));

    const onList = () => runAction(async () => listComplaints());

    const onCount = () => runAction(async () => {
        const value = await getComplaintCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 5</p>
                <h1>Complaint / Issue Reporting System</h1>
                <p className="subtitle">
                    File complaints, assign handlers, escalate issues, and track resolutions on the Stellar blockchain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total complaints: {countValue}</p>
            </section>

            <section className="panel">
                <h2>File a Complaint</h2>

                <label htmlFor="entryId">Complaint ID (Symbol, &lt;= 32 chars)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="reporter">Reporter Address</label>
                <input id="reporter" name="reporter" value={form.reporter} onChange={setField} placeholder="G..." />

                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" value={form.subject} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="4" value={form.description} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="service, billing, safety..." />

                <label htmlFor="severity">Severity (1-5, where 5 is most severe)</label>
                <input id="severity" name="severity" value={form.severity} onChange={setField} type="number" min="1" max="5" />

                <div className="actions">
                    <button type="button" onClick={onFile} disabled={isBusy}>File Complaint</button>
                    <button type="button" onClick={onEscalate} disabled={isBusy}>Escalate</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Complaint</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List All</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel">
                <h2>Assignment & Resolution</h2>

                <label htmlFor="admin">Admin Address (for assignment)</label>
                <input id="admin" name="admin" value={form.admin} onChange={setField} placeholder="G..." />

                <label htmlFor="assignee">Assignee / Handler Address</label>
                <input id="assignee" name="assignee" value={form.assignee} onChange={setField} placeholder="G..." />

                <label htmlFor="handler">Handler Address (for resolution)</label>
                <input id="handler" name="handler" value={form.handler} onChange={setField} placeholder="G..." />

                <label htmlFor="resolutionNotes">Resolution Notes</label>
                <textarea id="resolutionNotes" name="resolutionNotes" rows="3" value={form.resolutionNotes} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onAssign} disabled={isBusy}>Assign Complaint</button>
                    <button type="button" onClick={onResolve} disabled={isBusy}>Resolve Complaint</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
