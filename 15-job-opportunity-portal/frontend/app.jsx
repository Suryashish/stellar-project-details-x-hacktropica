import React, { useState } from "react";
import { checkConnection, postJob, applyJob, closeJob, hireApplicant, getJob, listJobs, getApplicationCount } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "job1",
        employer: "",
        title: "Senior Developer",
        description: "Looking for an experienced developer",
        location: "Remote",
        salaryMin: "80000",
        salaryMax: "120000",
        jobType: "fulltime",
        applicant: "",
        coverLetter: "I am excited to apply for this position.",
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

    const onPostJob = () => runAction(async () => postJob({
        id: form.id.trim(),
        employer: form.employer.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        salaryMin: form.salaryMin.trim(),
        salaryMax: form.salaryMax.trim(),
        jobType: form.jobType.trim(),
    }));

    const onApplyJob = () => runAction(async () => applyJob({
        jobId: form.id.trim(),
        applicant: form.applicant.trim(),
        coverLetter: form.coverLetter.trim(),
    }));

    const onCloseJob = () => runAction(async () => closeJob({
        id: form.id.trim(),
        employer: form.employer.trim(),
    }));

    const onHireApplicant = () => runAction(async () => hireApplicant({
        jobId: form.id.trim(),
        employer: form.employer.trim(),
        applicant: form.applicant.trim(),
    }));

    const onGetJob = () => runAction(async () => getJob(form.id.trim()));
    const onListJobs = () => runAction(async () => listJobs());
    const onGetAppCount = () => runAction(async () => {
        const count = await getApplicationCount(form.id.trim());
        return { jobId: form.id.trim(), applicationCount: count };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 15</p>
                <h1>Job Opportunity Portal</h1>
                <p className="subtitle">Post jobs, apply for positions, and manage hiring on-chain.</p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <h2>Post Job</h2>

                <label htmlFor="jobId">Job ID (Symbol)</label>
                <input id="jobId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="employer">Employer Address</label>
                <input id="employer" name="employer" value={form.employer} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Job Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={form.location} onChange={setField} />

                <label htmlFor="salaryMin">Salary Min (i128)</label>
                <input id="salaryMin" name="salaryMin" value={form.salaryMin} onChange={setField} type="number" />

                <label htmlFor="salaryMax">Salary Max (i128)</label>
                <input id="salaryMax" name="salaryMax" value={form.salaryMax} onChange={setField} type="number" />

                <label htmlFor="jobType">Job Type</label>
                <select id="jobType" name="jobType" value={form.jobType} onChange={setField}>
                    <option value="fulltime">fulltime</option>
                    <option value="parttime">parttime</option>
                    <option value="contract">contract</option>
                    <option value="remote">remote</option>
                </select>

                <div className="actions">
                    <button type="button" onClick={onPostJob} disabled={isBusy}>Post Job</button>
                    <button type="button" onClick={onCloseJob} disabled={isBusy}>Close Job</button>
                </div>
            </section>

            <section className="panel">
                <h2>Apply / Hire</h2>

                <label htmlFor="applicant">Applicant Address</label>
                <input id="applicant" name="applicant" value={form.applicant} onChange={setField} placeholder="G..." />

                <label htmlFor="coverLetter">Cover Letter</label>
                <textarea id="coverLetter" name="coverLetter" rows="3" value={form.coverLetter} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onApplyJob} disabled={isBusy}>Apply for Job</button>
                    <button type="button" onClick={onHireApplicant} disabled={isBusy}>Hire Applicant</button>
                </div>
            </section>

            <section className="panel">
                <h2>Query</h2>
                <div className="actions">
                    <button type="button" onClick={onGetJob} disabled={isBusy}>Get Job</button>
                    <button type="button" onClick={onListJobs} disabled={isBusy}>List Jobs</button>
                    <button type="button" onClick={onGetAppCount} disabled={isBusy}>Application Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
