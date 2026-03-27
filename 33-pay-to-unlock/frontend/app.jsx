import React, { useState } from "react";
import { checkConnection, createContent, purchaseContent, hasAccess, updatePrice, withdrawEarnings, getContent, listContent, getContentCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "content1",
        creator: "",
        title: "Advanced Soroban Patterns",
        preview: "Learn advanced smart contract patterns...",
        contentHash: "QmExampleHash123",
        price: "1000",
        buyer: "",
        paymentAmount: "1000",
        newPrice: "1500",
        user: "",
    });
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
        const nextWalletState = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(nextWalletState);
        return nextWalletState;
    });

    const onCreateContent = () => runAction(async () => createContent({
        id: form.id.trim(),
        creator: form.creator.trim(),
        title: form.title.trim(),
        preview: form.preview.trim(),
        contentHash: form.contentHash.trim(),
        price: form.price.trim(),
    }));

    const onPurchase = () => runAction(async () => purchaseContent({
        contentId: form.id.trim(),
        buyer: form.buyer.trim(),
        paymentAmount: form.paymentAmount.trim(),
    }));

    const onHasAccess = () => runAction(async () => {
        const value = await hasAccess(form.id.trim(), form.user.trim() || form.buyer.trim());
        return { hasAccess: value };
    });

    const onUpdatePrice = () => runAction(async () => updatePrice({
        id: form.id.trim(),
        creator: form.creator.trim(),
        newPrice: form.newPrice.trim(),
    }));

    const onWithdraw = () => runAction(async () => withdrawEarnings({
        id: form.id.trim(),
        creator: form.creator.trim(),
    }));

    const onGetContent = () => runAction(async () => getContent(form.id.trim()));

    const onList = () => runAction(async () => listContent());

    const onCount = () => runAction(async () => {
        const value = await getContentCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 33</p>
                <h1>Pay-to-Unlock</h1>
                <p className="subtitle">Publish premium content, accept payments, and manage access on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Content count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Create Content</h2>
                <label htmlFor="id">Content ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="creator">Creator Address</label>
                <input id="creator" name="creator" value={form.creator} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="preview">Preview Text</label>
                <textarea id="preview" name="preview" rows="2" value={form.preview} onChange={setField} />

                <label htmlFor="contentHash">Content Hash</label>
                <input id="contentHash" name="contentHash" value={form.contentHash} onChange={setField} />

                <label htmlFor="price">Price (i128)</label>
                <input id="price" name="price" value={form.price} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateContent} disabled={isBusy}>Create Content</button>
                </div>
            </section>

            <section className="panel">
                <h2>Purchase / Access</h2>
                <label htmlFor="buyer">Buyer Address</label>
                <input id="buyer" name="buyer" value={form.buyer} onChange={setField} placeholder="G..." />

                <label htmlFor="paymentAmount">Payment Amount (i128)</label>
                <input id="paymentAmount" name="paymentAmount" value={form.paymentAmount} onChange={setField} type="number" />

                <label htmlFor="user">Check Access For (optional, defaults to buyer)</label>
                <input id="user" name="user" value={form.user} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onPurchase} disabled={isBusy}>Purchase</button>
                    <button type="button" onClick={onHasAccess} disabled={isBusy}>Check Access</button>
                </div>
            </section>

            <section className="panel">
                <h2>Creator Actions</h2>
                <label htmlFor="newPrice">New Price (i128)</label>
                <input id="newPrice" name="newPrice" value={form.newPrice} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onUpdatePrice} disabled={isBusy}>Update Price</button>
                    <button type="button" onClick={onWithdraw} disabled={isBusy}>Withdraw Earnings</button>
                </div>
            </section>

            <section className="panel">
                <h2>Read Operations</h2>
                <div className="actions">
                    <button type="button" onClick={onGetContent} disabled={isBusy}>Get Content</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Content</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
