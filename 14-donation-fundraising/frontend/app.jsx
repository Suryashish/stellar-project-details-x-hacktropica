import React, { useState } from "react";
import { checkConnection, createCampaign, donate, closeCampaign, getCampaign, listCampaigns, getDonorCount, getTotalRaised } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "camp1",
        organizer: "",
        title: "Help Build a School",
        description: "Fundraising to build a community school",
        goalAmount: "10000",
        deadline: String(nowTs() + 2592000),
        donor: "",
        amount: "100",
        message: "Happy to help!",
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

    const onCreateCampaign = () => runAction(async () => createCampaign({
        id: form.id.trim(),
        organizer: form.organizer.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: form.goalAmount.trim(),
        deadline: form.deadline.trim(),
    }));

    const onDonate = () => runAction(async () => donate({
        campaignId: form.id.trim(),
        donor: form.donor.trim(),
        amount: form.amount.trim(),
        message: form.message.trim(),
    }));

    const onCloseCampaign = () => runAction(async () => closeCampaign({
        id: form.id.trim(),
        organizer: form.organizer.trim(),
    }));

    const onGetCampaign = () => runAction(async () => getCampaign(form.id.trim()));
    const onListCampaigns = () => runAction(async () => listCampaigns());
    const onGetDonorCount = () => runAction(async () => {
        const count = await getDonorCount(form.id.trim());
        return { campaignId: form.id.trim(), donorCount: count };
    });
    const onGetTotalRaised = () => runAction(async () => {
        const total = await getTotalRaised(form.id.trim());
        return { campaignId: form.id.trim(), totalRaised: total };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 14</p>
                <h1>Donation and Fundraising</h1>
                <p className="subtitle">Create campaigns, accept donations, and track fundraising progress on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <h2>Create Campaign</h2>

                <label htmlFor="campaignId">Campaign ID (Symbol)</label>
                <input id="campaignId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="organizer">Organizer Address</label>
                <input id="organizer" name="organizer" value={form.organizer} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="goalAmount">Goal Amount (i128)</label>
                <input id="goalAmount" name="goalAmount" value={form.goalAmount} onChange={setField} type="number" />

                <label htmlFor="deadline">Deadline (u64 timestamp)</label>
                <input id="deadline" name="deadline" value={form.deadline} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateCampaign} disabled={isBusy}>Create Campaign</button>
                    <button type="button" onClick={onCloseCampaign} disabled={isBusy}>Close Campaign</button>
                </div>
            </section>

            <section className="panel">
                <h2>Make Donation</h2>

                <label htmlFor="donor">Donor Address</label>
                <input id="donor" name="donor" value={form.donor} onChange={setField} placeholder="G..." />

                <label htmlFor="amount">Donation Amount (i128)</label>
                <input id="amount" name="amount" value={form.amount} onChange={setField} type="number" />

                <label htmlFor="message">Message</label>
                <input id="message" name="message" value={form.message} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onDonate} disabled={isBusy}>Donate</button>
                </div>
            </section>

            <section className="panel">
                <h2>Query</h2>
                <div className="actions">
                    <button type="button" onClick={onGetCampaign} disabled={isBusy}>Get Campaign</button>
                    <button type="button" onClick={onListCampaigns} disabled={isBusy}>List Campaigns</button>
                    <button type="button" onClick={onGetDonorCount} disabled={isBusy}>Donor Count</button>
                    <button type="button" onClick={onGetTotalRaised} disabled={isBusy}>Total Raised</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
