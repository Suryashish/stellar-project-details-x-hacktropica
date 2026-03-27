import React, { useState } from "react";
import { checkConnection, postNotice, editNotice, removeNotice, pinNotice, getNotice, listNotices, getNoticeCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const initialForm = () => ({
    id: "notice1",
    author: "",
    title: "Important Announcement",
    content: "This is a public notice posted on the blockchain.",
    category: "general",
    priority: "1",
    expiresAt: String(nowTs() + 86400 * 7),
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
        const next = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(next);
        return next;
    });

    const onPost = () => runAction(async () => postNotice({
        id: form.id.trim(),
        author: form.author.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        priority: form.priority.trim(),
        expiresAt: Number(form.expiresAt || nowTs() + 86400),
    }));

    const onEdit = () => runAction(async () => editNotice({
        id: form.id.trim(),
        author: form.author.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        priority: form.priority.trim(),
    }));

    const onRemove = () => runAction(async () => removeNotice({
        id: form.id.trim(),
        author: form.author.trim(),
    }));

    const onPin = () => runAction(async () => pinNotice({
        id: form.id.trim(),
        author: form.author.trim(),
    }));

    const onGet = () => runAction(async () => getNotice(form.id.trim()));

    const onList = () => runAction(async () => listNotices());

    const onCount = () => runAction(async () => {
        const value = await getNoticeCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 3</p>
                <h1>Public Notice Board</h1>
                <p className="subtitle">
                    Post announcements, pin important notices, edit content, and manage a decentralized bulletin board.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total notices: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Notice Details</h2>

                <label htmlFor="entryId">Notice ID (Symbol, &lt;= 32 chars)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="author">Author Address</label>
                <input id="author" name="author" value={form.author} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="content">Content</label>
                <textarea id="content" name="content" rows="5" value={form.content} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="general, urgent, event..." />

                <label htmlFor="priority">Priority (0 = low, 1 = normal, 2 = high, 3 = critical)</label>
                <input id="priority" name="priority" value={form.priority} onChange={setField} type="number" min="0" max="3" />

                <label htmlFor="expiresAt">Expires At (u64 timestamp)</label>
                <input id="expiresAt" name="expiresAt" value={form.expiresAt} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onPost} disabled={isBusy}>Post Notice</button>
                    <button type="button" onClick={onEdit} disabled={isBusy}>Edit Notice</button>
                    <button type="button" onClick={onPin} disabled={isBusy}>Pin / Unpin</button>
                    <button type="button" onClick={onRemove} disabled={isBusy}>Remove Notice</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Notice</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List All Notices</button>
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
