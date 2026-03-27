import React, { useState } from "react";
import { checkConnection, createCause, donateToCause, getCause, listCauses, getDonorTotal, getTopDonation, getCauseCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "cause1",
        organizer: "",
        name: "Community Garden",
        description: "Fund a local community garden",
        goalAmount: "10000",
        donor: "",
        donationAmount: "500",
        donationMessage: "Happy to help!",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [causeCount, setCauseCount] = useState("-");

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

    const onCreateCause = () => runAction(() => createCause({
        id: form.id.trim(),
        organizer: form.organizer.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        goalAmount: form.goalAmount.trim(),
    }));

    const onDonate = () => runAction(() => donateToCause({
        causeId: form.id.trim(),
        donor: form.donor.trim(),
        amount: form.donationAmount.trim(),
        message: form.donationMessage.trim(),
    }));

    const onGetCause = () => runAction(() => getCause(form.id.trim()));

    const onListCauses = () => runAction(() => listCauses());

    const onGetDonorTotal = () => runAction(() => getDonorTotal(form.id.trim(), form.donor.trim()));

    const onGetTopDonation = () => runAction(() => getTopDonation(form.id.trim()));

    const onGetCount = () => runAction(async () => {
        const value = await getCauseCount();
        setCauseCount(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 36</p>
                <h1>Donation Tracker</h1>
                <p className="subtitle">Create causes, donate, and track fundraising progress with a leaderboard.</p>
                <button type="button" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total causes: {causeCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="causeId">Cause ID</label>
                <input id="causeId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="organizer">Organizer Address</label>
                <input id="organizer" name="organizer" value={form.organizer} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Cause Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="2" value={form.description} onChange={setField} />

                <label htmlFor="goalAmount">Goal Amount (i128)</label>
                <input id="goalAmount" name="goalAmount" value={form.goalAmount} onChange={setField} type="number" />

                <label htmlFor="donor">Donor Address</label>
                <input id="donor" name="donor" value={form.donor} onChange={setField} placeholder="G..." />

                <label htmlFor="donationAmount">Donation Amount (i128)</label>
                <input id="donationAmount" name="donationAmount" value={form.donationAmount} onChange={setField} type="number" />

                <label htmlFor="donationMessage">Donation Message</label>
                <input id="donationMessage" name="donationMessage" value={form.donationMessage} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onCreateCause} disabled={isBusy}>Create Cause</button>
                    <button type="button" onClick={onDonate} disabled={isBusy}>Donate</button>
                    <button type="button" onClick={onGetCause} disabled={isBusy}>Get Cause</button>
                    <button type="button" onClick={onListCauses} disabled={isBusy}>List Causes</button>
                    <button type="button" onClick={onGetDonorTotal} disabled={isBusy}>Donor Total</button>
                    <button type="button" onClick={onGetTopDonation} disabled={isBusy}>Top Donation</button>
                    <button type="button" onClick={onGetCount} disabled={isBusy}>Cause Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
