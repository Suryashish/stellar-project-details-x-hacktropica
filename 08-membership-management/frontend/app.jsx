import React, { useState } from "react";
import { checkConnection, registerMember, upgradeTier, renewMembership, suspendMember, activateMember, getMember, listMembers, getMemberCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);
const oneYearFromNow = () => nowTs() + 365 * 24 * 60 * 60;

const initialForm = () => ({
    id: "mem1",
    member: "",
    admin: "",
    name: "John Doe",
    email: "john@example.com",
    tier: "basic",
    newTier: "silver",
    joinedAt: String(nowTs()),
    newExpiry: String(oneYearFromNow()),
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

    const onRegister = () => runAction(async () => registerMember({
        id: form.id.trim(),
        member: form.member.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        tier: form.tier.trim(),
        joinedAt: Number(form.joinedAt.trim() || nowTs()),
    }));

    const onUpgradeTier = () => runAction(async () => upgradeTier({
        id: form.id.trim(),
        member: form.member.trim(),
        newTier: form.newTier.trim(),
    }));

    const onRenew = () => runAction(async () => renewMembership({
        id: form.id.trim(),
        member: form.member.trim(),
        newExpiry: Number(form.newExpiry.trim() || oneYearFromNow()),
    }));

    const onSuspend = () => runAction(async () => suspendMember({
        id: form.id.trim(),
        admin: form.admin.trim(),
    }));

    const onActivate = () => runAction(async () => activateMember({
        id: form.id.trim(),
        admin: form.admin.trim(),
    }));

    const onGetMember = () => runAction(async () => getMember(form.id.trim()));
    const onListMembers = () => runAction(async () => listMembers());

    const onGetCount = () => runAction(async () => {
        const value = await getMemberCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 8</p>
                <h1>Membership Management System</h1>
                <p className="subtitle">
                    Register members, manage tiers, renew subscriptions, and handle suspensions.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total members: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Member Registration</h2>

                <label htmlFor="entryId">Member ID (Symbol)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="member">Member Address</label>
                <input id="member" name="member" value={form.member} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="email">Email</label>
                <input id="email" name="email" value={form.email} onChange={setField} type="email" />

                <label htmlFor="tier">Tier (basic / silver / gold / platinum)</label>
                <select id="tier" name="tier" value={form.tier} onChange={setField}>
                    <option value="basic">Basic</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                </select>

                <label htmlFor="joinedAt">Joined At (u64 timestamp)</label>
                <input id="joinedAt" name="joinedAt" value={form.joinedAt} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onRegister} disabled={isBusy}>Register Member</button>
                    <button type="button" onClick={onGetMember} disabled={isBusy}>Get Member</button>
                    <button type="button" onClick={onListMembers} disabled={isBusy}>List Members</button>
                    <button type="button" onClick={onGetCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel">
                <h2>Membership Actions</h2>

                <label htmlFor="newTier">New Tier</label>
                <select id="newTier" name="newTier" value={form.newTier} onChange={setField}>
                    <option value="basic">Basic</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                </select>

                <label htmlFor="newExpiry">New Expiry (u64 timestamp)</label>
                <input id="newExpiry" name="newExpiry" value={form.newExpiry} onChange={setField} type="number" />

                <label htmlFor="admin">Admin Address (for suspend/activate)</label>
                <input id="admin" name="admin" value={form.admin} onChange={setField} placeholder="G..." />

                <div className="actions">
                    <button type="button" onClick={onUpgradeTier} disabled={isBusy}>Upgrade Tier</button>
                    <button type="button" onClick={onRenew} disabled={isBusy}>Renew Membership</button>
                    <button type="button" onClick={onSuspend} disabled={isBusy}>Suspend Member</button>
                    <button type="button" onClick={onActivate} disabled={isBusy}>Activate Member</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
