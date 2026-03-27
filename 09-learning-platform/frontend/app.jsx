import React, { useState } from "react";
import { checkConnection, createCourse, enrollStudent, completeCourse, rateCourse, getCourse, listCourses, getEnrollmentCount } from "../lib.js/stellar.js";

const initialForm = () => ({
    id: "course1",
    instructor: "",
    student: "",
    title: "Intro to Soroban",
    description: "Learn smart contract development on Stellar",
    category: "blockchain",
    maxStudents: "30",
    price: "5000",
    rating: "5",
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

    const onCreateCourse = () => runAction(async () => createCourse({
        id: form.id.trim(),
        instructor: form.instructor.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        maxStudents: form.maxStudents.trim(),
        price: form.price.trim(),
    }));

    const onEnrollStudent = () => runAction(async () => enrollStudent({
        courseId: form.id.trim(),
        student: form.student.trim(),
    }));

    const onCompleteCourse = () => runAction(async () => completeCourse({
        courseId: form.id.trim(),
        student: form.student.trim(),
    }));

    const onRateCourse = () => runAction(async () => rateCourse({
        courseId: form.id.trim(),
        student: form.student.trim(),
        rating: form.rating.trim(),
    }));

    const onGetCourse = () => runAction(async () => getCourse(form.id.trim()));
    const onListCourses = () => runAction(async () => listCourses());
    const onGetEnrollmentCount = () => runAction(async () => getEnrollmentCount(form.id.trim()));

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 9</p>
                <h1>Learning Platform</h1>
                <p className="subtitle">
                    Create courses, enroll students, track completions, and manage ratings.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <h2>Course Details</h2>

                <label htmlFor="entryId">Course ID (Symbol)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="instructor">Instructor Address</label>
                <input id="instructor" name="instructor" value={form.instructor} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="3" value={form.description} onChange={setField} />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} />

                <label htmlFor="maxStudents">Max Students (u32)</label>
                <input id="maxStudents" name="maxStudents" value={form.maxStudents} onChange={setField} type="number" />

                <label htmlFor="price">Price (i128)</label>
                <input id="price" name="price" value={form.price} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onCreateCourse} disabled={isBusy}>Create Course</button>
                    <button type="button" onClick={onGetCourse} disabled={isBusy}>Get Course</button>
                    <button type="button" onClick={onListCourses} disabled={isBusy}>List Courses</button>
                </div>
            </section>

            <section className="panel">
                <h2>Student Actions</h2>

                <label htmlFor="student">Student Address</label>
                <input id="student" name="student" value={form.student} onChange={setField} placeholder="G..." />

                <label htmlFor="rating">Rating (1-5)</label>
                <select id="rating" name="rating" value={form.rating} onChange={setField}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>

                <div className="actions">
                    <button type="button" onClick={onEnrollStudent} disabled={isBusy}>Enroll Student</button>
                    <button type="button" onClick={onCompleteCourse} disabled={isBusy}>Complete Course</button>
                    <button type="button" onClick={onRateCourse} disabled={isBusy}>Rate Course</button>
                    <button type="button" onClick={onGetEnrollmentCount} disabled={isBusy}>Get Enrollment Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
