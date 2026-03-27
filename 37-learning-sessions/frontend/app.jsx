import React, { useState } from "react";
import { checkConnection, createSession, bookSession, startSession, completeSession, cancelSession, rateSession, getSession, listSessions } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "session1",
        tutor: "",
        student: "",
        subject: "Introduction to Stellar",
        description: "Learn the basics of Stellar smart contracts",
        sessionDate: String(nowTs() + 86400),
        durationMins: "60",
        price: "500",
        maxAttendees: "10",
        paymentAmount: "500",
        rating: "5",
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

    const onCreateSession = () => runAction(() => createSession({
        id: form.id.trim(),
        tutor: form.tutor.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        sessionDate: form.sessionDate.trim(),
        durationMins: form.durationMins.trim(),
        price: form.price.trim(),
        maxAttendees: form.maxAttendees.trim(),
    }));

    const onBookSession = () => runAction(() => bookSession(form.id.trim(), form.student.trim(), form.paymentAmount.trim()));

    const onStartSession = () => runAction(() => startSession(form.id.trim(), form.tutor.trim()));

    const onCompleteSession = () => runAction(() => completeSession(form.id.trim(), form.tutor.trim()));

    const onCancelSession = () => runAction(() => cancelSession(form.id.trim(), form.tutor.trim()));

    const onRateSession = () => runAction(() => rateSession(form.id.trim(), form.student.trim(), form.rating.trim()));

    const onGetSession = () => runAction(() => getSession(form.id.trim()));

    const onListSessions = () => runAction(() => listSessions());

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 37</p>
                <h1>Pay-per-Session Learning</h1>
                <p className="subtitle">Create tutoring sessions, book with payment, rate after completion.</p>
                <button type="button" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <label htmlFor="sessionId">Session ID</label>
                <input id="sessionId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="tutor">Tutor Address</label>
                <input id="tutor" name="tutor" value={form.tutor} onChange={setField} placeholder="G..." />

                <label htmlFor="student">Student Address</label>
                <input id="student" name="student" value={form.student} onChange={setField} placeholder="G..." />

                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" value={form.subject} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="2" value={form.description} onChange={setField} />

                <label htmlFor="sessionDate">Session Date (u64 timestamp)</label>
                <input id="sessionDate" name="sessionDate" value={form.sessionDate} onChange={setField} type="number" />

                <label htmlFor="durationMins">Duration (minutes)</label>
                <input id="durationMins" name="durationMins" value={form.durationMins} onChange={setField} type="number" />

                <label htmlFor="price">Price (i128)</label>
                <input id="price" name="price" value={form.price} onChange={setField} type="number" />

                <label htmlFor="maxAttendees">Max Attendees</label>
                <input id="maxAttendees" name="maxAttendees" value={form.maxAttendees} onChange={setField} type="number" />

                <label htmlFor="paymentAmount">Payment Amount (i128)</label>
                <input id="paymentAmount" name="paymentAmount" value={form.paymentAmount} onChange={setField} type="number" />

                <label htmlFor="rating">Rating (1-5)</label>
                <input id="rating" name="rating" value={form.rating} onChange={setField} type="number" min="1" max="5" />

                <div className="actions">
                    <button type="button" onClick={onCreateSession} disabled={isBusy}>Create Session</button>
                    <button type="button" onClick={onBookSession} disabled={isBusy}>Book Session</button>
                    <button type="button" onClick={onStartSession} disabled={isBusy}>Start Session</button>
                    <button type="button" onClick={onCompleteSession} disabled={isBusy}>Complete Session</button>
                    <button type="button" onClick={onCancelSession} disabled={isBusy}>Cancel Session</button>
                    <button type="button" onClick={onRateSession} disabled={isBusy}>Rate Session</button>
                    <button type="button" onClick={onGetSession} disabled={isBusy}>Get Session</button>
                    <button type="button" onClick={onListSessions} disabled={isBusy}>List Sessions</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
