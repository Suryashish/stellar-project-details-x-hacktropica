import React, { useState } from "react";
import { checkConnection, createProposal, castVote, executeProposal, vetoProposal, getProposal, listProposals, hasVoted, getProposalCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "prop1",
        proposer: "",
        title: "Fund ecosystem grants",
        description: "Allocate 10000 XLM for developer grants",
        category: "treasury",
        votingPeriod: "604800",
        voter: "",
        votePower: "100",
        inFavor: true,
        executor: "",
        vetoer: "",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [countValue, setCountValue] = useState("-");

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
        const nextWalletState = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(nextWalletState);
        return nextWalletState;
    });

    const onCreateProposal = () => runAction(async () => createProposal({
        id: form.id.trim(),
        proposer: form.proposer.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        votingPeriod: form.votingPeriod.trim(),
    }));

    const onCastVote = () => runAction(async () => castVote({
        proposalId: form.id.trim(),
        voter: form.voter.trim(),
        votePower: form.votePower.trim(),
        inFavor: form.inFavor,
    }));

    const onExecute = () => runAction(async () => executeProposal({
        id: form.id.trim(),
        executor: form.executor.trim() || form.proposer.trim(),
    }));

    const onVeto = () => runAction(async () => vetoProposal({
        id: form.id.trim(),
        vetoer: form.vetoer.trim() || form.proposer.trim(),
    }));

    const onGetProposal = () => runAction(async () => getProposal(form.id.trim()));

    const onList = () => runAction(async () => listProposals());

    const onHasVoted = () => runAction(async () => {
        const value = await hasVoted(form.id.trim(), form.voter.trim());
        return { hasVoted: value };
    });

    const onCount = () => runAction(async () => {
        const value = await getProposalCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 32</p>
                <h1>DAO Voting</h1>
                <p className="subtitle">Create proposals, cast weighted votes, execute or veto governance decisions.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Proposal count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Create Proposal</h2>
                <label htmlFor="id">Proposal ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="proposer">Proposer Address</label>
                <input id="proposer" name="proposer" value={form.proposer} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} />

                <label htmlFor="votingPeriod">Voting Period (seconds)</label>
                <input id="votingPeriod" name="votingPeriod" value={form.votingPeriod} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateProposal} disabled={isBusy}>Create Proposal</button>
                </div>
            </section>

            <section className="panel">
                <h2>Vote</h2>
                <label htmlFor="voter">Voter Address</label>
                <input id="voter" name="voter" value={form.voter} onChange={setField} placeholder="G..." />

                <label htmlFor="votePower">Vote Power (i128)</label>
                <input id="votePower" name="votePower" value={form.votePower} onChange={setField} type="number" />

                <label htmlFor="inFavor" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                    <input id="inFavor" name="inFavor" type="checkbox" checked={form.inFavor} onChange={setField} />
                    Vote In Favor
                </label>

                <div className="actions">
                    <button type="button" onClick={onCastVote} disabled={isBusy}>Cast Vote</button>
                </div>
            </section>

            <section className="panel">
                <h2>Governance Actions</h2>
                <label htmlFor="executor">Executor Address (optional, defaults to proposer)</label>
                <input id="executor" name="executor" value={form.executor} onChange={setField} placeholder="G..." />

                <label htmlFor="vetoer">Vetoer Address (optional, defaults to proposer)</label>
                <input id="vetoer" name="vetoer" value={form.vetoer} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onExecute} disabled={isBusy}>Execute Proposal</button>
                    <button type="button" onClick={onVeto} disabled={isBusy}>Veto Proposal</button>
                </div>
            </section>

            <section className="panel">
                <h2>Read Operations</h2>
                <div className="actions">
                    <button type="button" onClick={onGetProposal} disabled={isBusy}>Get Proposal</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Proposals</button>
                    <button type="button" onClick={onHasVoted} disabled={isBusy}>Has Voted?</button>
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
