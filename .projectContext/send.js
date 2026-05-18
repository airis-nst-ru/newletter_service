#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// --- Config ---
const API_URL = "http://localhost:5001/api/v1/email/send";
const API_KEY = "wewillwin";
const SUBJECT = "The AIRIS Chronicle";

// --- Read file path from args ---
const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: node send.js <path-to-emails.json>");
    process.exit(1);
}

const resolved = path.resolve(filePath);
if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
}

const raw = fs.readFileSync(resolved, "utf-8");
const emails = JSON.parse(raw);

if (!Array.isArray(emails)) {
    console.error("JSON file must contain an array of email strings.");
    process.exit(1);
}

console.log(`Sending to ${emails.length} recipient(s)...`);

fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    },
    body: JSON.stringify({ emails, subject: SUBJECT }),
})
    .then((res) => res.json())
    .then((data) => {
        console.log("\nResponse:", JSON.stringify(data, null, 2));
    })
    .catch((err) => {
        console.error("Request failed:", err.message);
        process.exit(1);
    });
