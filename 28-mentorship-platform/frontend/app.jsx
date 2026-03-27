import React, { useState } from "react";
import { checkConnection, registerMentor, requestMentorship, acceptMentee, completeSession, rateMentor, getMentor, listMentors, getMentorCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "mentor1",
        mentor: "",
        name: "Alice",
        expertise: "rust",
        bio: "Experienced Soroban developer",
        hourlyRate: "100",
        maxMentees: "5",
        mentee: "",
        message: "I'd like to learn Soroban",
        hours: "2",
        sessionNotes: "Covered contract basics",
        rating: "5",
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

    const onRegister = () => runAction(async () => registerMentor({
        id: form.id.trim(),
        mentor: form.mentor.trim(),
        name: form.name.trim(),
        expertise: form.expertise.trim(),
        bio: form.bio.trim(),
        hourlyRate: form.hourlyRate.trim(),
        maxMentees: form.maxMentees.trim(),
    }));

    const onRequestMentorship = () => runAction(async () => requestMentorship({
        mentorId: form.id.trim(),
        mentee: form.mentee.trim(),
        message: form.message.trim(),
    }));

    const onAcceptMentee = () => runAction(async () => acceptMentee({
        mentorId: form.id.trim(),
        mentor: form.mentor.trim(),
        mentee: form.mentee.trim(),
    }));

    const onCompleteSession = () => runAction(async () => completeSession({
        mentorId: form.id.trim(),
        mentor: form.mentor.trim(),
        hours: form.hours.trim(),
        sessionNotes: form.sessionNotes.trim(),
    }));

    const onRate = () => runAction(async () => rateMentor({
        mentorId: form.id.trim(),
        mentee: form.mentee.trim(),
        rating: form.rating.trim(),
    }));

    const onGetMentor = () => runAction(async () => getMentor(form.id.trim()));

    const onList = () => runAction(async () => listMentors());

    const onCount = () => runAction(async () => {
        const value = await getMentorCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 28</p>
                <h1>Mentorship Platform</h1>
                <p className="subtitle">Register mentors, request mentorship, complete sessions, and rate mentors.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Registered mentor count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Mentor Registration</h2>
                <label htmlFor="id">Mentor ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="mentor">Mentor Address</label>
                <input id="mentor" name="mentor" value={form.mentor} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="expertise">Expertise (Symbol)</label>
                <input id="expertise" name="expertise" value={form.expertise} onChange={setField} />

                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" rows="2" value={form.bio} onChange={setField} />

                <label htmlFor="hourlyRate">Hourly Rate (i128)</label>
                <input id="hourlyRate" name="hourlyRate" value={form.hourlyRate} onChange={setField} type="number" />

                <label htmlFor="maxMentees">Max Mentees</label>
                <input id="maxMentees" name="maxMentees" value={form.maxMentees} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onRegister} disabled={isBusy}>Register Mentor</button>
                </div>
            </section>

            <section className="panel">
                <h2>Mentorship Actions</h2>
                <label htmlFor="mentee">Mentee Address</label>
                <input id="mentee" name="mentee" value={form.mentee} onChange={setField} placeholder="G..." />

                <label htmlFor="message">Request Message</label>
                <input id="message" name="message" value={form.message} onChange={setField} />

                <label htmlFor="hours">Session Hours</label>
                <input id="hours" name="hours" value={form.hours} onChange={setField} type="number" />

                <label htmlFor="sessionNotes">Session Notes</label>
                <textarea id="sessionNotes" name="sessionNotes" rows="2" value={form.sessionNotes} onChange={setField} />

                <label htmlFor="rating">Rating (1-5)</label>
                <input id="rating" name="rating" value={form.rating} onChange={setField} type="number" min="1" max="5" />

                <div className="actions">
                    <button type="button" onClick={onRequestMentorship} disabled={isBusy}>Request Mentorship</button>
                    <button type="button" onClick={onAcceptMentee} disabled={isBusy}>Accept Mentee</button>
                    <button type="button" onClick={onCompleteSession} disabled={isBusy}>Complete Session</button>
                    <button type="button" onClick={onRate} disabled={isBusy}>Rate Mentor</button>
                </div>
            </section>

            <section className="panel">
                <h2>Read Operations</h2>
                <div className="actions">
                    <button type="button" onClick={onGetMentor} disabled={isBusy}>Get Mentor</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Mentors</button>
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
