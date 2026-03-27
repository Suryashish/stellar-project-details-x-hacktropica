import React, { useState } from "react";
import { checkConnection, createInvoice, markPaid, markOverdue, cancelInvoice, getInvoice, listInvoices, getTotalOutstanding } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);
const thirtyDaysFromNow = () => nowTs() + 30 * 24 * 60 * 60;

const initialForm = () => ({
    id: "inv1",
    issuer: "",
    recipient: "",
    payer: "",
    description: "Web development services",
    amount: "10000",
    paidAmount: "10000",
    dueDate: String(thirtyDaysFromNow()),
    paidAt: String(nowTs()),
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

    const onCreateInvoice = () => runAction(async () => createInvoice({
        id: form.id.trim(),
        issuer: form.issuer.trim(),
        recipient: form.recipient.trim(),
        description: form.description.trim(),
        amount: form.amount.trim(),
        dueDate: Number(form.dueDate.trim() || thirtyDaysFromNow()),
    }));

    const onMarkPaid = () => runAction(async () => markPaid({
        id: form.id.trim(),
        payer: form.payer.trim(),
        paidAmount: form.paidAmount.trim(),
        paidAt: Number(form.paidAt.trim() || nowTs()),
    }));

    const onMarkOverdue = () => runAction(async () => markOverdue({
        id: form.id.trim(),
        issuer: form.issuer.trim(),
    }));

    const onCancelInvoice = () => runAction(async () => cancelInvoice({
        id: form.id.trim(),
        issuer: form.issuer.trim(),
    }));

    const onGetInvoice = () => runAction(async () => getInvoice(form.id.trim()));
    const onListInvoices = () => runAction(async () => listInvoices());
    const onGetTotalOutstanding = () => runAction(async () => getTotalOutstanding());

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 10</p>
                <h1>Payment Tracking System</h1>
                <p className="subtitle">
                    Create invoices, track payments, manage overdue accounts, and view outstanding balances.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <h2>Invoice Details</h2>

                <label htmlFor="entryId">Invoice ID (Symbol)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="issuer">Issuer Address</label>
                <input id="issuer" name="issuer" value={form.issuer} onChange={setField} placeholder="G..." />

                <label htmlFor="recipient">Recipient Address</label>
                <input id="recipient" name="recipient" value={form.recipient} onChange={setField} placeholder="G..." />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="2" value={form.description} onChange={setField} />

                <label htmlFor="amount">Amount (i128)</label>
                <input id="amount" name="amount" value={form.amount} onChange={setField} type="number" />

                <label htmlFor="dueDate">Due Date (u64 timestamp)</label>
                <input id="dueDate" name="dueDate" value={form.dueDate} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateInvoice} disabled={isBusy}>Create Invoice</button>
                    <button type="button" onClick={onGetInvoice} disabled={isBusy}>Get Invoice</button>
                    <button type="button" onClick={onListInvoices} disabled={isBusy}>List Invoices</button>
                </div>
            </section>

            <section className="panel">
                <h2>Payment Actions</h2>

                <label htmlFor="payer">Payer Address</label>
                <input id="payer" name="payer" value={form.payer} onChange={setField} placeholder="G..." />

                <label htmlFor="paidAmount">Paid Amount (i128)</label>
                <input id="paidAmount" name="paidAmount" value={form.paidAmount} onChange={setField} type="number" />

                <label htmlFor="paidAt">Paid At (u64 timestamp)</label>
                <input id="paidAt" name="paidAt" value={form.paidAt} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onMarkPaid} disabled={isBusy}>Mark Paid</button>
                    <button type="button" onClick={onMarkOverdue} disabled={isBusy}>Mark Overdue</button>
                    <button type="button" onClick={onCancelInvoice} disabled={isBusy}>Cancel Invoice</button>
                    <button type="button" onClick={onGetTotalOutstanding} disabled={isBusy}>Get Total Outstanding</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
