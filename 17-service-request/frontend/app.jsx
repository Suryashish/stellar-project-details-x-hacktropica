import React, { useState } from "react";
import { checkConnection, createRequest, acceptRequest, submitWork, approveWork, rejectWork, getRequest, listRequests } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

const initialForm = () => ({
    id: "req1",
    requester: "",
    provider: "",
    title: "Fix homepage layout",
    description: "The header overlaps on mobile devices",
    priority: "3",
    category: "bugfix",
    budget: "1000",
    workNotes: "",
    reason: "",
});

export default function App() {
    const [form, setForm] = useState(initialForm);
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);

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

    const onCreate = () => runAction(async () => createRequest({
        id: form.id.trim(),
        requester: form.requester.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority.trim(),
        category: form.category.trim(),
        budget: form.budget.trim(),
    }));

    const onAccept = () => runAction(async () => acceptRequest({
        id: form.id.trim(),
        provider: form.provider.trim(),
    }));

    const onSubmit = () => runAction(async () => submitWork({
        id: form.id.trim(),
        provider: form.provider.trim(),
        workNotes: form.workNotes.trim(),
    }));

    const onApprove = () => runAction(async () => approveWork({
        id: form.id.trim(),
        requester: form.requester.trim(),
    }));

    const onReject = () => runAction(async () => rejectWork({
        id: form.id.trim(),
        requester: form.requester.trim(),
        reason: form.reason.trim(),
    }));

    const onGet = () => runAction(async () => getRequest(form.id.trim()));

    const onList = () => runAction(async () => listRequests());

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 17</p>
                <h1>Service Request System</h1>
                <p className="subtitle">
                    Create work orders, accept jobs, submit work, and manage approvals on-chain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <label htmlFor="reqId">Request ID (Symbol)</label>
                <input id="reqId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="requester">Requester Address</label>
                <input id="requester" name="requester" value={form.requester} onChange={setField} placeholder="G..." />

                <label htmlFor="provider">Provider Address</label>
                <input id="provider" name="provider" value={form.provider} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="priority">Priority (1-5)</label>
                <input id="priority" name="priority" value={form.priority} onChange={setField} type="number" min="1" max="5" />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="bugfix, feature, support..." />

                <label htmlFor="budget">Budget (i128)</label>
                <input id="budget" name="budget" value={form.budget} onChange={setField} type="number" />

                <label htmlFor="workNotes">Work Notes (for submit)</label>
                <textarea id="workNotes" name="workNotes" rows="3" value={form.workNotes} onChange={setField} />

                <label htmlFor="reason">Rejection Reason</label>
                <input id="reason" name="reason" value={form.reason} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onCreate} disabled={isBusy}>Create Request</button>
                    <button type="button" onClick={onAccept} disabled={isBusy}>Accept Request</button>
                    <button type="button" onClick={onSubmit} disabled={isBusy}>Submit Work</button>
                    <button type="button" onClick={onApprove} disabled={isBusy}>Approve Work</button>
                    <button type="button" onClick={onReject} disabled={isBusy}>Reject Work</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Request</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Requests</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
