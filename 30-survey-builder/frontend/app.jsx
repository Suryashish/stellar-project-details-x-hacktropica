import React, { useState } from "react";
import { checkConnection, createSurvey, submitResponse, closeSurvey, getSurvey, listSurveys, getResponseCount, hasResponded, getSurveyCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "survey1",
        creator: "",
        title: "Developer Satisfaction Survey",
        description: "Rate your experience with Soroban",
        questionCount: "5",
        endTime: String(nowTs() + 86400),
        respondent: "",
        answers: "5,4,3,5,4",
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

    const onCreateSurvey = () => runAction(async () => createSurvey({
        id: form.id.trim(),
        creator: form.creator.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        questionCount: form.questionCount.trim(),
        endTime: form.endTime.trim(),
    }));

    const onSubmitResponse = () => runAction(async () => submitResponse({
        surveyId: form.id.trim(),
        respondent: form.respondent.trim(),
        answers: form.answers.trim(),
    }));

    const onCloseSurvey = () => runAction(async () => closeSurvey({
        id: form.id.trim(),
        creator: form.creator.trim(),
    }));

    const onGetSurvey = () => runAction(async () => getSurvey(form.id.trim()));

    const onList = () => runAction(async () => listSurveys());

    const onResponseCount = () => runAction(async () => {
        const value = await getResponseCount(form.id.trim());
        return { responseCount: value };
    });

    const onHasResponded = () => runAction(async () => {
        const value = await hasResponded(form.id.trim(), form.respondent.trim());
        return { hasResponded: value };
    });

    const onCount = () => runAction(async () => {
        const value = await getSurveyCount();
        setCountValue(String(value));
        return { count: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 30</p>
                <h1>Survey Builder</h1>
                <p className="subtitle">Create surveys, collect responses, and analyze results on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Survey count: {countValue}</p>
            </section>

            <section className="panel">
                <h2>Create Survey</h2>
                <label htmlFor="id">Survey ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="creator">Creator Address</label>
                <input id="creator" name="creator" value={form.creator} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="2" value={form.description} onChange={setField} />

                <label htmlFor="questionCount">Question Count</label>
                <input id="questionCount" name="questionCount" value={form.questionCount} onChange={setField} type="number" />

                <label htmlFor="endTime">End Time (unix timestamp)</label>
                <input id="endTime" name="endTime" value={form.endTime} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateSurvey} disabled={isBusy}>Create Survey</button>
                </div>
            </section>

            <section className="panel">
                <h2>Respond to Survey</h2>
                <label htmlFor="respondent">Respondent Address</label>
                <input id="respondent" name="respondent" value={form.respondent} onChange={setField} placeholder="G..." />

                <label htmlFor="answers">Answers (delimited string)</label>
                <textarea id="answers" name="answers" rows="2" value={form.answers} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onSubmitResponse} disabled={isBusy}>Submit Response</button>
                    <button type="button" onClick={onCloseSurvey} disabled={isBusy}>Close Survey</button>
                </div>
            </section>

            <section className="panel">
                <h2>Read Operations</h2>
                <div className="actions">
                    <button type="button" onClick={onGetSurvey} disabled={isBusy}>Get Survey</button>
                    <button type="button" onClick={onList} disabled={isBusy}>List Surveys</button>
                    <button type="button" onClick={onResponseCount} disabled={isBusy}>Response Count</button>
                    <button type="button" onClick={onHasResponded} disabled={isBusy}>Has Responded?</button>
                    <button type="button" onClick={onCount} disabled={isBusy}>Get Survey Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
