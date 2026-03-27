import React, { useState } from "react";
import { checkConnection, createChannel, joinChannel, sendMemo, getMemo, getChannel, listChannels, getChannelMessageCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "memo1",
        channelId: "general",
        creator: "",
        sender: "",
        member: "",
        channelName: "General Chat",
        description: "Public discussion channel",
        content: "Hello channel!",
        isPublic: true,
        timestamp: String(nowTs()),
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);

    const setField = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

    const onCreateChannel = () => runAction(() => createChannel({
        id: form.channelId.trim(),
        creator: form.creator.trim(),
        channelName: form.channelName.trim(),
        description: form.description.trim(),
        isPublic: form.isPublic,
    }));

    const onJoinChannel = () => runAction(() => joinChannel(form.channelId.trim(), form.member.trim()));

    const onSendMemo = () => runAction(() => sendMemo({
        id: form.id.trim(),
        sender: form.sender.trim(),
        channel: form.channelId.trim(),
        content: form.content.trim(),
        timestamp: form.timestamp.trim(),
    }));

    const onGetMemo = () => runAction(() => getMemo(form.id.trim()));

    const onGetChannel = () => runAction(() => getChannel(form.channelId.trim()));

    const onListChannels = () => runAction(() => listChannels());

    const onGetMsgCount = () => runAction(() => getChannelMessageCount(form.channelId.trim()));

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 35</p>
                <h1>Transaction Memo Chat</h1>
                <p className="subtitle">Create channels, join conversations, and send memos on-chain.</p>
                <button type="button" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <label htmlFor="channelId">Channel ID</label>
                <input id="channelId" name="channelId" value={form.channelId} onChange={setField} />

                <label htmlFor="creator">Creator / Sender Address</label>
                <input id="creator" name="creator" value={form.creator} onChange={setField} placeholder="G..." />

                <label htmlFor="sender">Memo Sender Address</label>
                <input id="sender" name="sender" value={form.sender} onChange={setField} placeholder="G..." />

                <label htmlFor="member">Member Address (for join)</label>
                <input id="member" name="member" value={form.member} onChange={setField} placeholder="G..." />

                <label htmlFor="channelName">Channel Name</label>
                <input id="channelName" name="channelName" value={form.channelName} onChange={setField} />

                <label htmlFor="description">Description</label>
                <input id="description" name="description" value={form.description} onChange={setField} />

                <label htmlFor="memoId">Memo ID</label>
                <input id="memoId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="content">Memo Content</label>
                <textarea id="content" name="content" rows="3" value={form.content} onChange={setField} />

                <label htmlFor="timestamp">Timestamp (u64)</label>
                <input id="timestamp" name="timestamp" value={form.timestamp} onChange={setField} type="number" />

                <label>
                    <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={setField} />
                    Public Channel
                </label>

                <div className="actions">
                    <button type="button" onClick={onCreateChannel} disabled={isBusy}>Create Channel</button>
                    <button type="button" onClick={onJoinChannel} disabled={isBusy}>Join Channel</button>
                    <button type="button" onClick={onSendMemo} disabled={isBusy}>Send Memo</button>
                    <button type="button" onClick={onGetMemo} disabled={isBusy}>Get Memo</button>
                    <button type="button" onClick={onGetChannel} disabled={isBusy}>Get Channel</button>
                    <button type="button" onClick={onListChannels} disabled={isBusy}>List Channels</button>
                    <button type="button" onClick={onGetMsgCount} disabled={isBusy}>Message Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
