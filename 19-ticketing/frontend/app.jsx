import React, { useState } from "react";
import { checkConnection, createTicket, assignTicket, addResponse, closeTicket, reopenTicket, getTicket, listTickets, getOpenCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

const initialForm = () => ({
    id: "tkt1",
    reporter: "",
    admin: "",
    assignee: "",
    responder: "",
    closer: "",
    subject: "Login page returns 500 error",
    description: "Users cannot log in since the latest deployment",
    category: "bug",
    priority: "3",
    message: "",
});

export default function App() {
    const [form, setForm] = useState(initialForm);
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [openCount, setOpenCount] = useState("-");

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

    const onCreate = () => runAction(async () => createTicket({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        priority: form.priority.trim(),
    }));

    const onAssign = () => runAction(async () => assignTicket({
        id: form.id.trim(),
        admin: form.admin.trim(),
        assignee: form.assignee.trim(),
    }));

    const onRespond = () => runAction(async () => addResponse({
        id: form.id.trim(),
        responder: form.responder.trim(),
        message: form.message.trim(),
    }));

    const onClose = () => runAction(async () => closeTicket({
        id: form.id.trim(),
        closer: form.closer.trim(),
    }));

    const onReopen = () => runAction(async () => reopenTicket({
        id: form.id.trim(),
        reporter: form.reporter.trim(),
    }));

    const onGet = () => runAction(async () => getTicket(form.id.trim()));

    const onList = () => runAction(async () => listTickets());

    const onOpenCount = () => runAction(async () => {
        const value = await getOpenCount();
        setOpenCount(String(value));
        return { openCount: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 19</p>
                <h1>Support Ticket System</h1>
                <p className="subtitle">
                    Create tickets, assign agents, track responses, and manage resolution on-chain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Open tickets: {openCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="ticketId">Ticket ID (Symbol)</label>
                <input id="ticketId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="reporter">Reporter Address</label>
                <input id="reporter" name="reporter" value={form.reporter} onChange={setField} placeholder="G..." />

                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" value={form.subject} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="bug, feature, question..." />

                <label htmlFor="priority">Priority (1-5)</label>
                <input id="priority" name="priority" value={form.priority} onChange={setField} type="number" min="1" max="5" />

                <label htmlFor="admin">Admin Address (for assign)</label>
                <input id="admin" name="admin" value={form.admin} onChange={setField} placeholder="G..." />

                <label htmlFor="assignee">Assignee Address</label>
                <input id="assignee" name="assignee" value={form.assignee} onChange={setField} placeholder="G..." />

                <label htmlFor="responder">Responder Address</label>
                <input id="responder" name="responder" value={form.responder} onChange={setField} placeholder="G..." />

                <label htmlFor="message">Response Message</label>
                <textarea id="message" name="message" rows="3" value={form.message} onChange={setField} />

                <label htmlFor="closer">Closer Address</label>
                <input id="closer" name="closer" value={form.closer} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onCreate} disabled={isBusy}>Create Ticket</button>
                    <button type="button" onClick={onAssign} disabled={isBusy}>Assign Ticket</button>
                    <button type="button" onClick={onRespond} disabled={isBusy}>Add Response</button>
                    <button type="button" onClick={onClose} disabled={isBusy}>Close Ticket</button>
                    <button type="button" onClick={onReopen} disabled={isBusy}>Reopen Ticket</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Ticket</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Tickets</button>
                    <button type="button" onClick={onOpenCount} disabled={isBusy}>Open Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
