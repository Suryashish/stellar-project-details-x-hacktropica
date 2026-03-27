import React, { useState } from "react";
import { checkConnection, uploadDoc, shareDoc, revokeAccess, updateDoc, getDoc, listDocs, getDocCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

const initialForm = () => ({
    id: "doc1",
    owner: "",
    title: "Project Whitepaper",
    docHash: "QmXoYpBf7c5e4a1d2b3...",
    docType: "pdf",
    fileSize: "2048",
    sharedWith: "",
    revokedFrom: "",
    newHash: "",
    newSize: "",
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

    const onUpload = () => runAction(async () => uploadDoc({
        id: form.id.trim(),
        owner: form.owner.trim(),
        title: form.title.trim(),
        docHash: form.docHash.trim(),
        docType: form.docType.trim(),
        fileSize: form.fileSize.trim(),
    }));

    const onShare = () => runAction(async () => shareDoc({
        id: form.id.trim(),
        owner: form.owner.trim(),
        sharedWith: form.sharedWith.trim(),
    }));

    const onRevoke = () => runAction(async () => revokeAccess({
        id: form.id.trim(),
        owner: form.owner.trim(),
        revokedFrom: form.revokedFrom.trim(),
    }));

    const onUpdate = () => runAction(async () => updateDoc({
        id: form.id.trim(),
        owner: form.owner.trim(),
        newHash: form.newHash.trim(),
        newSize: form.newSize.trim(),
    }));

    const onGet = () => runAction(async () => getDoc(form.id.trim()));

    const onList = () => runAction(async () => listDocs());

    const onCount = () => runAction(async () => {
        const value = await getDocCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 18</p>
                <h1>Document Sharing Registry</h1>
                <p className="subtitle">
                    Upload documents, share access, manage versions, and track document metadata on-chain.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total documents: {countValue}</p>
            </section>

            <section className="panel">
                <label htmlFor="docId">Document ID (Symbol)</label>
                <input id="docId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Document Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="docHash">Document Hash</label>
                <input id="docHash" name="docHash" value={form.docHash} onChange={setField} placeholder="IPFS or content hash" />

                <label htmlFor="docType">Document Type (Symbol)</label>
                <input id="docType" name="docType" value={form.docType} onChange={setField} placeholder="pdf, doc, img..." />

                <label htmlFor="fileSize">File Size (bytes)</label>
                <input id="fileSize" name="fileSize" value={form.fileSize} onChange={setField} type="number" />

                <label htmlFor="sharedWith">Share With Address</label>
                <input id="sharedWith" name="sharedWith" value={form.sharedWith} onChange={setField} placeholder="G..." />

                <label htmlFor="revokedFrom">Revoke From Address</label>
                <input id="revokedFrom" name="revokedFrom" value={form.revokedFrom} onChange={setField} placeholder="G..." />

                <label htmlFor="newHash">New Hash (for update)</label>
                <input id="newHash" name="newHash" value={form.newHash} onChange={setField} />

                <label htmlFor="newSize">New Size (for update)</label>
                <input id="newSize" name="newSize" value={form.newSize} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onUpload} disabled={isBusy}>Upload Document</button>
                    <button type="button" onClick={onShare} disabled={isBusy}>Share Document</button>
                    <button type="button" onClick={onRevoke} disabled={isBusy}>Revoke Access</button>
                    <button type="button" onClick={onUpdate} disabled={isBusy}>Update Version</button>
                    <button type="button" onClick={onGet} disabled={isBusy}>Get Document</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Documents</button>
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
