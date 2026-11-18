# PKSF facts worth knowing (exam and viva)

Collected 2026-11-16 from PKSF's own site and Bangladeshi news. Check figures marked † on pksf.org.bd, because sources disagree.

## Basics
- **Palli Karma-Sahayak Foundation**: set up in **1990** by the Government of Bangladesh as a **not-for-profit company** registered under the Companies Act 1913/1994.
- Mandate: poverty alleviation through sustainable employment, financing, skill training and other services.
- **Second-tier (apex) organisation**: it doesn't lend to people directly but funds **Partner Organisations (POs)**, which lend to members. POs number **200+** (the ToR), **223** or **268**† depending on the page.
- Members are organised in groups; **more than 90% of borrowers are women**.
- Address: PKSF Bhaban-1, E-4/B, Agargaon, Sher-e-Bangla Nagar, Dhaka-1207.

## Leadership (as of Sep 2026)
- **Chairman:** Zakir Ahmed Khan
- **Managing Director:** Md Fazlul Kader
- Governance: General Body and Governing Body.

## Recent headlines (2026)
- **Independence Award 2026** (Swadhinata Puroskar), handed to the Chairman by Prime Minister Tarique Rahman.
- **FY2026-27 financing target of Tk 160 billion**, up **45.34%**, approved by the General Body in June 2026 and focused on skills and decent employment.
- **SOPAN fund** (cottage and micro entrepreneurs): Tk 2,500 crore to 101 POs; about 50,000 entrepreneurs, 87% of them women.

## Programmes
- Four mainstream credit programmes: **Jagoron** (rural general microcredit), **Agrosor** (micro-enterprise), **Buniad** (the ultra-poor) and **Sufolon** (seasonal and agriculture).
- Also: urban microcredit; projects with the World Bank, ADB and IFAD, such as **RMTP** (Rural Microenterprise Transformation Project) and **SMART**, plus earlier ones such as SEP and LICHSP.
- Jagoron FY2025-26 (to April): about 9.46 million borrowers; average loan about BDT 62,000†.

## Digital and IT (most relevant to your job, ITDSD)
- **Almost 100% digital reporting** from POs, and paperless systems.
- **"Amader PKSF" portal (2023-24):** all POs report **via API**, giving real-time oversight.
- **OLRS (Online Reporting System):** the reporting application for POs.
- Stated next goals: **AI-driven credit**, digital banking, and a **cashless ecosystem**.
- RMTP mentions ICT, blockchain (distributed ledger), e-commerce and crowdfunding.
- Link to the ToR: bulk file uploads and financial reports from POs (Spring Batch), Material Design UI for PO field users, Keycloak SSO, and sensitive financial data.

**Use in answers:** when an architecture or scenario question has no context, set it at PKSF. For example: "a PO submits monthly loan data via a REST API, a Spring Batch job validates it, it is stored in PostgreSQL with Redis caching for dashboards, and access uses Keycloak RBAC (PO user vs PKSF officer)". At the viva, mention Amader PKSF or OLRS to show you have done your homework.

## Vacancy notice (2026): what you would build
- PKSF is building a **next-generation Decision Support System (DSS)** that "turns nationwide operations into real-time, actionable insight".
- Stated work: **cloud-native architecture, AI-assisted development, complex systems integration, large-scale data**.
- Posts (27): Senior Software Engineer (Full-stack) ×4 at BDT 1,60,000; **Software Engineer (Full-stack) ×16 at BDT 1,20,000**; Software Test Engineer ×3 at 1,20,000; Senior Mobile Application Developer ×1 at 1,60,000; Mobile Application Developer ×1 at 1,20,000; Data Architect ×1 at 1,60,000 (1-year tenure); ERP Finance & Accounting Implementation Specialist ×1 at 2,00,000 (2 years). Engineering posts have a 4-year initial tenure, renewed annually on performance.
- Apply online by **23 September 2026**. Only shortlisted candidates are contacted.
- **Use in answers and the viva:** frame design answers around the DSS (PO data → pipeline → warehouse → dashboards) and say how you'd use AI-assisted development responsibly (code review, tests, no sensitive data in prompts).

## Sources
- PKSF vacancy announcement (DSS posts), General Manager (HRD), deadline 23 September 2026 (newspaper or website notice, as shared by the candidate)
- [PKSF: About Us](https://pksf.org.bd/about-us/) · [Governing Body](https://pksf.org.bd/governing-body/) · [Lending Activities](https://pksf.org.bd/lending-activities/) · [Jagoron](https://pksf.org.bd/our-activities/core-programmes/jagoron/)
- [PKSF: Digital Transformation](https://pksf.org.bd/digital-transformation/) · [RMTP](https://pksf.org.bd/projects/rural-microenterprise-transformation-project-rmtp/) · [SMART](https://pksf.org.bd/sustainable-microenterprise-and-resilient-transformation-smart/)
- [PKSF receives Independence Award 2026](https://pksf.org.bd/pksf-receives-independence-award-2026/)
- [UNB: PKSF approves Tk 160 billion budget for FY27](https://unb.com.bd/category/Bangladesh/pksf-approves-tk-160-billion-budget-for-fy27/188968) · [Financial Express](https://thefinancialexpress.com.bd/economy/bangladesh/pksf-raises-fy27-financing-target-by-45pc-to-boost-employment)
- [TBS: PKSF, ERF agreement (Sep 2026)](https://www.tbsnews.net/economy/corporates/pksf-erf-sign-agreement-promote-evidence-based-journalism-1558776)
- [Daily Sun: SOPAN disbursement](https://www.daily-sun.com/bangladesh/907990)
- [ADB: Microenterprise Financing project document](https://www.adb.org/sites/default/files/linked-documents/51269-003-ld-02.pdf)
- [Wikipedia: Palli Karma Sahayak Foundation](https://en.wikipedia.org/wiki/Palli_Karma_Sahayak_Foundation)
