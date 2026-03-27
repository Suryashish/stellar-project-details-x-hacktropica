import React, { useState } from "react";
import { checkConnection, createArticle, editArticle, upvoteArticle, markAnswer, archiveArticle, getArticle, listArticles, getArticleCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "article1",
        author: "",
        title: "Getting Started with Soroban",
        content: "Soroban is a smart contracts platform...",
        category: "tutorial",
        tags: "soroban,stellar,rust",
        editor: "",
        newContent: "",
        voter: "",
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

    const onCreateArticle = () => runAction(async () => createArticle({
        id: form.id.trim(),
        author: form.author.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        tags: form.tags.trim(),
    }));

    const onEditArticle = () => runAction(async () => editArticle({
        id: form.id.trim(),
        editor: form.editor.trim() || form.author.trim(),
        newContent: form.newContent.trim(),
    }));

    const onUpvote = () => runAction(async () => upvoteArticle({
        id: form.id.trim(),
        voter: form.voter.trim() || form.author.trim(),
    }));

    const onMarkAnswer = () => runAction(async () => markAnswer({
        id: form.id.trim(),
        author: form.author.trim(),
    }));

    const onArchive = () => runAction(async () => archiveArticle({
        id: form.id.trim(),
        author: form.author.trim(),
    }));

    const onGetArticle = () => runAction(async () => getArticle(form.id.trim()));

    const onList = () => runAction(async () => listArticles());

    const onCount = () => runAction(async () => {
        const value = await getArticleCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 29</p>
                <h1>Knowledge Base</h1>
                <p className="subtitle">Create articles, edit content, upvote, mark answers, and archive.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Article count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Create Article</h2>
                <label htmlFor="id">Article ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="author">Author Address</label>
                <input id="author" name="author" value={form.author} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="content">Content</label>
                <textarea id="content" name="content" rows="4" value={form.content} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} />

                <label htmlFor="tags">Tags (comma-separated)</label>
                <input id="tags" name="tags" value={form.tags} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onCreateArticle} disabled={isBusy}>Create Article</button>
                </div>
            </section>

            <section className="panel">
                <h2>Edit / Interact</h2>
                <label htmlFor="editor">Editor Address (optional, defaults to author)</label>
                <input id="editor" name="editor" value={form.editor} onChange={setField} placeholder="G..." />

                <label htmlFor="newContent">New Content (for editing)</label>
                <textarea id="newContent" name="newContent" rows="3" value={form.newContent} onChange={setField} />

                <label htmlFor="voter">Voter Address (optional, defaults to author)</label>
                <input id="voter" name="voter" value={form.voter} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onEditArticle} disabled={isBusy}>Edit Article</button>
                    <button type="button" onClick={onUpvote} disabled={isBusy}>Upvote</button>
                    <button type="button" onClick={onMarkAnswer} disabled={isBusy}>Mark as Answer</button>
                    <button type="button" onClick={onArchive} disabled={isBusy}>Archive</button>
                </div>
            </section>

            <section className="panel">
                <h2>Read Operations</h2>
                <div className="actions">
                    <button type="button" onClick={onGetArticle} disabled={isBusy}>Get Article</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Articles</button>
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
