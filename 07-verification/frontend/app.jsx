import React, { useState } from "react";
import { checkConnection, submitCredential, verifyCredential, revokeCredential, checkValidity, getCredential, listCredentials, getCredentialCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);
const oneYearFromNow = () => nowTs() + 365 * 24 * 60 * 60;

const initialForm = () => ({
    id: "cred1",
    holder: "",
    verifier: "",
    credentialType: "certificate",
    issuerName: "Example University",
    dataHash: "abc123hash",
    issuedAt: String(nowTs()),
    expiresAt: String(oneYearFromNow()),
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

    const onSubmitCredential = () => runAction(async () => submitCredential({
        id: form.id.trim(),
        holder: form.holder.trim(),
        credentialType: form.credentialType.trim(),
        issuerName: form.issuerName.trim(),
        dataHash: form.dataHash.trim(),
        issuedAt: Number(form.issuedAt.trim() || nowTs()),
        expiresAt: Number(form.expiresAt.trim() || oneYearFromNow()),
    }));

    const onVerifyCredential = () => runAction(async () => verifyCredential({
        id: form.id.trim(),
        verifier: form.verifier.trim(),
    }));

    const onRevokeCredential = () => runAction(async () => revokeCredential({
        id: form.id.trim(),
        holder: form.holder.trim(),
    }));

    const onCheckValidity = () => runAction(async () => checkValidity(form.id.trim()));
    const onGetCredential = () => runAction(async () => getCredential(form.id.trim()));
    const onListCredentials = () => runAction(async () => listCredentials());

    const onGetCount = () => runAction(async () => {
        const value = await getCredentialCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 7</p>
                <h1>Credential Verification System</h1>
                <p className="subtitle">
                    Submit, verify, and manage credentials on-chain with expiry and revocation support.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Stored credential count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Credential Details</h2>

                <label htmlFor="entryId">Credential ID (Symbol)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="holder">Holder Address</label>
                <input id="holder" name="holder" value={form.holder} onChange={setField} placeholder="G..." />

                <label htmlFor="verifier">Verifier Address</label>
                <input id="verifier" name="verifier" value={form.verifier} onChange={setField} placeholder="G..." />

                <label htmlFor="credentialType">Credential Type (Symbol)</label>
                <input id="credentialType" name="credentialType" value={form.credentialType} onChange={setField} />

                <label htmlFor="issuerName">Issuer Name</label>
                <input id="issuerName" name="issuerName" value={form.issuerName} onChange={setField} />

                <label htmlFor="dataHash">Data Hash</label>
                <input id="dataHash" name="dataHash" value={form.dataHash} onChange={setField} />

                <label htmlFor="issuedAt">Issued At (u64 timestamp)</label>
                <input id="issuedAt" name="issuedAt" value={form.issuedAt} onChange={setField} type="number" />

                <label htmlFor="expiresAt">Expires At (u64 timestamp)</label>
                <input id="expiresAt" name="expiresAt" value={form.expiresAt} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onSubmitCredential} disabled={isBusy}>Submit Credential</button>
                    <button type="button" onClick={onVerifyCredential} disabled={isBusy}>Verify Credential</button>
                    <button type="button" onClick={onRevokeCredential} disabled={isBusy}>Revoke Credential</button>
                    <button type="button" onClick={onCheckValidity} disabled={isBusy}>Check Validity</button>
                    <button type="button" onClick={onGetCredential} disabled={isBusy}>Get Credential</button>
                    <button type="button" onClick={onListCredentials} disabled={isBusy}>List Credentials</button>
                    <button type="button" onClick={onGetCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
