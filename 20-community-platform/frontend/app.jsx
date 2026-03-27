import React, { useState } from "react";
import { checkConnection, createPost, likePost, commentPost, flagPost, removePost, getPost, listPosts, getPostCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

const initialForm = () => ({
    id: "post1",
    author: "",
    content: "Just deployed my first Soroban smart contract!",
    category: "general",
    tags: "stellar, soroban, web3",
    liker: "",
    commenter: "",
    commentText: "",
    flagger: "",
});

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

    const onCreate = () => runAction(async () => createPost({
        id: form.id.trim(),
        author: form.author.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        tags: form.tags.trim(),
    }));

    const onLike = () => runAction(async () => likePost({
        id: form.id.trim(),
        liker: form.liker.trim() || form.author.trim(),
    }));

    const onComment = () => runAction(async () => commentPost({
        id: form.id.trim(),
        commenter: form.commenter.trim() || form.author.trim(),
        commentText: form.commentText.trim(),
    }));

    const onFlag = () => runAction(async () => flagPost({
        id: form.id.trim(),
        flagger: form.flagger.trim() || form.author.trim(),
    }));

    const onRemove = () => runAction(async () => removePost({
        id: form.id.trim(),
        author: form.author.trim(),
    }));

    const onGet = () => runAction(async () => getPost(form.id.trim()));

    const onList = () => runAction(async () => listPosts());

    const onCount = () => runAction(async () => {
        const value = await getPostCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 20</p>
                <h1>Community Platform</h1>
                <p className="subtitle">
                    Create posts, like, comment, flag for moderation, and manage community content on-chain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total posts: {countValue}</p>
            </section>

            <section className="panel">
                <label htmlFor="postId">Post ID (Symbol)</label>
                <input id="postId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="author">Author Address</label>
                <input id="author" name="author" value={form.author} onChange={setField} placeholder="G..." />

                <label htmlFor="content">Content</label>
                <textarea id="content" name="content" rows="4" value={form.content} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} placeholder="general, tech, art..." />

                <label htmlFor="tags">Tags (comma-separated)</label>
                <input id="tags" name="tags" value={form.tags} onChange={setField} />

                <label htmlFor="liker">Liker Address</label>
                <input id="liker" name="liker" value={form.liker} onChange={setField} placeholder="G..." />

                <label htmlFor="commenter">Commenter Address</label>
                <input id="commenter" name="commenter" value={form.commenter} onChange={setField} placeholder="G..." />

                <label htmlFor="commentText">Comment Text</label>
                <textarea id="commentText" name="commentText" rows="2" value={form.commentText} onChange={setField} />

                <label htmlFor="flagger">Flagger Address</label>
                <input id="flagger" name="flagger" value={form.flagger} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onCreate} disabled={isBusy}>Create Post</button>
                    <button type="button" onClick={onLike} disabled={isBusy}>Like Post</button>
                    <button type="button" onClick={onComment} disabled={isBusy}>Comment</button>
                    <button type="button" onClick={onFlag} disabled={isBusy}>Flag Post</button>
                    <button type="button" onClick={onRemove} disabled={isBusy}>Remove Post</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Post</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Posts</button>
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
