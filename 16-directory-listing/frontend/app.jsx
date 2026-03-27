import React, { useState } from "react";
import { checkConnection, createListing, updateListing, verifyListing, deactivateListing, rateListing, getListing, listAll } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

const initialForm = () => ({
    id: "biz1",
    owner: "",
    name: "Stellar Coffee Shop",
    category: "food",
    description: "Best coffee in town",
    contact: "hello@stellarcoffee.io",
    website: "https://stellarcoffee.io",
    location: "123 Main St, Blockchain City",
    verifier: "",
    rater: "",
    rating: "5",
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

    const onCreate = () => runAction(async () => createListing({
        id: form.id.trim(),
        owner: form.owner.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        contact: form.contact.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
    }));

    const onUpdate = () => runAction(async () => updateListing({
        id: form.id.trim(),
        owner: form.owner.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        contact: form.contact.trim(),
        website: form.website.trim(),
    }));

    const onVerify = () => runAction(async () => verifyListing({
        id: form.id.trim(),
        verifier: form.verifier.trim() || form.owner.trim(),
    }));

    const onDeactivate = () => runAction(async () => deactivateListing({
        id: form.id.trim(),
        owner: form.owner.trim(),
    }));

    const onRate = () => runAction(async () => rateListing({
        id: form.id.trim(),
        rater: form.rater.trim() || form.owner.trim(),
        rating: form.rating.trim(),
    }));

    const onGet = () => runAction(async () => getListing(form.id.trim()));

    const onList = () => runAction(async () => listAll());

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 16</p>
                <h1>Business Directory</h1>
                <p className="subtitle">
                    Create, verify, rate, and manage business/service listings on-chain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <label htmlFor="listingId">Listing ID (Symbol)</label>
                <input id="listingId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Business Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="food, retail, tech..." />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="contact">Contact</label>
                <input id="contact" name="contact" value={form.contact} onChange={setField} />

                <label htmlFor="website">Website</label>
                <input id="website" name="website" value={form.website} onChange={setField} />

                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={form.location} onChange={setField} />

                <label htmlFor="verifier">Verifier Address (for verify action)</label>
                <input id="verifier" name="verifier" value={form.verifier} onChange={setField} placeholder="G..." />

                <label htmlFor="rater">Rater Address (for rate action)</label>
                <input id="rater" name="rater" value={form.rater} onChange={setField} placeholder="G..." />

                <label htmlFor="rating">Rating (1-5)</label>
                <input id="rating" name="rating" value={form.rating} onChange={setField} type="number" min="1" max="5" />

                <div className="actions">
                    <button type="button" onClick={onCreate} disabled={isBusy}>Create Listing</button>
                    <button type="button" onClick={onUpdate} disabled={isBusy}>Update Listing</button>
                    <button type="button" onClick={onVerify} disabled={isBusy}>Verify Listing</button>
                    <button type="button" onClick={onDeactivate} disabled={isBusy}>Deactivate</button>
                    <button type="button" onClick={onRate} disabled={isBusy}>Rate Listing</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Listing</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List All</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
