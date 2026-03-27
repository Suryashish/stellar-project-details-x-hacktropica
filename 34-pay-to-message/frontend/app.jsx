import React, { useState } from "react";
import { checkConnection, setRate, sendMessage, readMessage, getMessage, listInbox, getRate, getEarnings } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "msg1",
        sender: "",
        recipient: "",
        content: "Hello there!",
        paymentAmount: "100",
        rate: "50",
    });
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

    const onSetRate = () => runAction(() => setRate(form.recipient.trim(), form.rate.trim()));

    const onSendMessage = () => runAction(() => sendMessage({
        id: form.id.trim(),
        sender: form.sender.trim(),
        recipient: form.recipient.trim(),
        content: form.content.trim(),
        paymentAmount: form.paymentAmount.trim(),
    }));

    const onReadMessage = () => runAction(() => readMessage(form.id.trim(), form.recipient.trim()));

    const onGetMessage = () => runAction(() => getMessage(form.id.trim()));

    const onListInbox = () => runAction(() => listInbox(form.recipient.trim()));

    const onGetRate = () => runAction(() => getRate(form.recipient.trim()));

    const onGetEarnings = () => runAction(() => getEarnings(form.recipient.trim()));

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 34</p>
                <h1>Pay-to-Message</h1>
                <p className="subtitle">Send paid messages to recipients who set their own message rate.</p>
                <button type="button" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <label htmlFor="msgId">Message ID</label>
                <input id="msgId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="sender">Sender Address</label>
                <input id="sender" name="sender" value={form.sender} onChange={setField} placeholder="G..." />

                <label htmlFor="recipient">Recipient Address</label>
                <input id="recipient" name="recipient" value={form.recipient} onChange={setField} placeholder="G..." />

                <label htmlFor="content">Message Content</label>
                <textarea id="content" name="content" rows="3" value={form.content} onChange={setField} />

                <label htmlFor="paymentAmount">Payment Amount (i128)</label>
                <input id="paymentAmount" name="paymentAmount" value={form.paymentAmount} onChange={setField} type="number" />

                <label htmlFor="rate">Rate Per Message (i128)</label>
                <input id="rate" name="rate" value={form.rate} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onSetRate} disabled={isBusy}>Set Rate</button>
                    <button type="button" onClick={onSendMessage} disabled={isBusy}>Send Message</button>
                    <button type="button" onClick={onReadMessage} disabled={isBusy}>Mark Read</button>
                    <button type="button" onClick={onGetMessage} disabled={isBusy}>Get Message</button>
                    <button type="button" onClick={onListInbox} disabled={isBusy}>List Inbox</button>
                    <button type="button" onClick={onGetRate} disabled={isBusy}>Get Rate</button>
                    <button type="button" onClick={onGetEarnings} disabled={isBusy}>Get Earnings</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
