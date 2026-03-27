import React, { useState } from "react";
import { checkConnection, createPoll, castVote, closePoll, getResults, getPoll, listPolls, hasVoted } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "poll1",
        creator: "",
        question: "What is your favorite option?",
        optionsCount: "3",
        endTime: String(nowTs() + 86400),
        voter: "",
        optionIndex: "0",
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

    const onCreatePoll = () => runAction(async () => createPoll({
        id: form.id.trim(),
        creator: form.creator.trim(),
        question: form.question.trim(),
        optionsCount: form.optionsCount.trim(),
        endTime: form.endTime.trim(),
    }));

    const onCastVote = () => runAction(async () => castVote({
        pollId: form.id.trim(),
        voter: form.voter.trim(),
        optionIndex: form.optionIndex.trim(),
    }));

    const onClosePoll = () => runAction(async () => closePoll({
        pollId: form.id.trim(),
        creator: form.creator.trim(),
    }));

    const onGetResults = () => runAction(async () => getResults(form.id.trim()));
    const onGetPoll = () => runAction(async () => getPoll(form.id.trim()));
    const onListPolls = () => runAction(async () => listPolls());
    const onHasVoted = () => runAction(async () => {
        const voted = await hasVoted(form.id.trim(), form.voter.trim());
        return { hasVoted: voted };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 11</p>
                <h1>Voting / Polling System</h1>
                <p className="subtitle">Create polls, cast votes, and view results on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <h2>Poll Management</h2>

                <label htmlFor="pollId">Poll ID (Symbol)</label>
                <input id="pollId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="creator">Creator Address</label>
                <input id="creator" name="creator" value={form.creator} onChange={setField} placeholder="G..." />

                <label htmlFor="question">Question</label>
                <input id="question" name="question" value={form.question} onChange={setField} />

                <label htmlFor="optionsCount">Number of Options (u32)</label>
                <input id="optionsCount" name="optionsCount" value={form.optionsCount} onChange={setField} type="number" />

                <label htmlFor="endTime">End Time (u64 timestamp)</label>
                <input id="endTime" name="endTime" value={form.endTime} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreatePoll} disabled={isBusy}>Create Poll</button>
                    <button type="button" onClick={onClosePoll} disabled={isBusy}>Close Poll</button>
                    <button type="button" onClick={onGetPoll} disabled={isBusy}>Get Poll</button>
                    <button type="button" onClick={onListPolls} disabled={isBusy}>List Polls</button>
                </div>
            </section>

            <section className="panel">
                <h2>Cast Vote</h2>

                <label htmlFor="voter">Voter Address</label>
                <input id="voter" name="voter" value={form.voter} onChange={setField} placeholder="G..." />

                <label htmlFor="optionIndex">Option Index (0-based)</label>
                <input id="optionIndex" name="optionIndex" value={form.optionIndex} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCastVote} disabled={isBusy}>Cast Vote</button>
                    <button type="button" onClick={onGetResults} disabled={isBusy}>Get Results</button>
                    <button type="button" onClick={onHasVoted} disabled={isBusy}>Has Voted?</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
