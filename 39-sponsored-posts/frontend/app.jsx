import React, { useState } from "react";
import { checkConnection, createAd, approveAd, recordView, pauseAd, resumeAd, getAd, listAds, getAdCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "ad1",
        advertiser: "",
        publisher: "",
        viewer: "",
        title: "Summer Sale Campaign",
        content: "Get 50% off all items this summer!",
        targetAudience: "general",
        budget: "10000",
        costPerView: "10",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [adCount, setAdCount] = useState("-");

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

    const onCreateAd = () => runAction(() => createAd({
        id: form.id.trim(),
        advertiser: form.advertiser.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        targetAudience: form.targetAudience.trim(),
        budget: form.budget.trim(),
        costPerView: form.costPerView.trim(),
    }));

    const onApproveAd = () => runAction(() => approveAd(form.id.trim(), form.publisher.trim()));

    const onRecordView = () => runAction(() => recordView(form.id.trim(), form.viewer.trim()));

    const onPauseAd = () => runAction(() => pauseAd(form.id.trim(), form.advertiser.trim()));

    const onResumeAd = () => runAction(() => resumeAd(form.id.trim(), form.advertiser.trim()));

    const onGetAd = () => runAction(() => getAd(form.id.trim()));

    const onListAds = () => runAction(() => listAds());

    const onGetAdCount = () => runAction(async () => {
        const value = await getAdCount();
        setAdCount(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 39</p>
                <h1>Sponsored Posts</h1>
                <p className="subtitle">Create ad campaigns, approve as publisher, track views and budget spend.</p>
                <button type="button" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total ads: {adCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="adId">Ad ID</label>
                <input id="adId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="advertiser">Advertiser Address</label>
                <input id="advertiser" name="advertiser" value={form.advertiser} onChange={setField} placeholder="G..." />

                <label htmlFor="publisher">Publisher Address</label>
                <input id="publisher" name="publisher" value={form.publisher} onChange={setField} placeholder="G..." />

                <label htmlFor="viewer">Viewer Address</label>
                <input id="viewer" name="viewer" value={form.viewer} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Ad Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="content">Ad Content</label>
                <textarea id="content" name="content" rows="3" value={form.content} onChange={setField} />

                <label htmlFor="targetAudience">Target Audience (Symbol)</label>
                <input id="targetAudience" name="targetAudience" value={form.targetAudience} onChange={setField} />

                <label htmlFor="budget">Budget (i128)</label>
                <input id="budget" name="budget" value={form.budget} onChange={setField} type="number" />

                <label htmlFor="costPerView">Cost Per View (i128)</label>
                <input id="costPerView" name="costPerView" value={form.costPerView} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateAd} disabled={isBusy}>Create Ad</button>
                    <button type="button" onClick={onApproveAd} disabled={isBusy}>Approve Ad</button>
                    <button type="button" onClick={onRecordView} disabled={isBusy}>Record View</button>
                    <button type="button" onClick={onPauseAd} disabled={isBusy}>Pause Ad</button>
                    <button type="button" onClick={onResumeAd} disabled={isBusy}>Resume Ad</button>
                    <button type="button" onClick={onGetAd} disabled={isBusy}>Get Ad</button>
                    <button type="button" onClick={onListAds} disabled={isBusy}>List Ads</button>
                    <button type="button" onClick={onGetAdCount} disabled={isBusy}>Ad Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
