CGC UNIVERSITY, JHANJERI
Department of Computer Science — APEX


ENGINEERING CLINICS
FINAL PROJECT REPORT
B.Tech. — 3rd Semester | Academic Year 2026–27


SOURCELENS
AI-POWERED DOCUMENT AND SOURCE-CODE
SIMILARITY REVIEW PLATFORM
(Software-Based Academic Integrity Review System)



Submitted by
Roll number
Under the guidance of
Aryan
2510002271
Mr. Ankur Srivastava, Associate Professor
Ashutosh Maurya
2510002072
Ms. Deepshikha, Associate Professor
Arpit Thakur
2510002252




October 2026

DECLARATION
The project report titled “SourceLens: AI-Powered Document and Source-Code Similarity Review Platform” has been prepared for the Engineering Clinics course in the B.Tech. third semester. The report documents the implemented software architecture, methodology, design decisions, evaluation plan and observed prototype checks for document and source-code similarity analysis against submitted work and discoverable web sources.
The report distinguishes design targets from measured results. Performance values described as targets are not presented as completed experimental findings. Any implementation status, test evidence, or approval required by the institution should be verified by the project team and faculty before formal submission.
Student
Roll number
Signature
Aryan
2510002271


Ashutosh Maurya
2510002072


Arpit Thakur
2510002252




ACKNOWLEDGEMENT
The team expresses its gratitude to the faculty mentors, Mr. Ankur Srivastava and Ms. Deepshikha, for their academic guidance and for helping frame the project as an engineering problem involving artificial intelligence, software systems and information retrieval. The team also acknowledges the Department of Computer Science — APEX at CGC University, Jhanjeri, for providing an academic setting in which software engineering and responsible AI can be explored.
The project draws on the work of researchers and maintainers in plagiarism detection, semantic sentence embeddings, source-code analysis, information retrieval and open-source software. Their published methods and documentation inform the proposed design. The report aims to present these elements as a coherent, privacy-aware system while retaining the instructor as the final decision-maker.

TABLE OF CONTENTS
S. No.
Section title
Page
1
Abstract


2
Introduction


3
Problem Statement and Objectives


4
Scope of the Project


5
Literature Review / Existing System


6
System / Methodology


7
Tools and Technologies Used


8
Software Requirements


9
Design and Implementation


10
Testing, Results and Discussion


11
Challenges, Learning Outcomes, Conclusion and Future Scope


12
Patent / Research Paper


13
References (IEEE Format)


Appendix A
Data Dictionary and Event Mapping


Appendix B
Test Plan and Review Checklist

Appendix C
Document and Code Processing Notes

Appendix D
Dashboard and Reporting Design Principles

Appendix E
Risk Register



Page numbers can shift when opened in a different Word version or after local editing. Use Word’s automatic table-of-contents update if a page-numbered TOC is required.
PROJECT PARTICULARS
Item
Details
Project title
SourceLens: AI-Powered Document and Source-Code Similarity Review Platform
App name
SourceLens
Short description
AI-based document and source-code similarity review system
Institution
CGC University, Jhanjeri
Department
Computer Science — APEX (project synopsis wording: Computer Science & Engineering, Artificial Intelligence & Machine Learning — APEX)
Academic year
2nd Year, 3rd Semester (2026–27)
Team members
Aryan — 2510002271; Ashutosh Maurya — 2510002072; Arpit Thakur — 2510002252
Project mentors
Mr. Ankur Srivastava, Associate Professor; Ms. Deepshikha, Associate Professor
Implemented system
Next.js web frontend + FastAPI backend + MongoDB Atlas metadata/results/reviews + Qdrant vector store + local Hugging Face sentence-transformers embeddings + PydanticAI review coordinator + optional Groq explanations (gated by ALLOW_EXTERNAL_AI)
Estimated software cost
To be determined from selected hosting, search API and model plans; local/open-source options may reduce cost
Important boundary
Outputs are review indicators only; the system does not independently determine misconduct.


1. ABSTRACT
The project, “SourceLens: AI-Powered Document and Source-Code Similarity Review Platform,” is a software system that helps authorised reviewers find potentially reused material in documents and source code. Users submit supported files, which are extracted, normalised and compared with other submissions in the institution’s collection. A web-source workflow can search for relevant public pages and compare retrieved content, subject to the configured search provider, access rules and licensing. Lexical comparison uses TF-IDF and cosine similarity; semantic comparison uses locally computed sentence embeddings from a Hugging Face model; and code comparison uses normalised tokens. The Next.js frontend calls an authenticated FastAPI backend. MongoDB Atlas stores submission metadata, comparison results and reviewer decisions, while Qdrant stores semantic vectors. A PydanticAI review coordinator can use scoped tools to inspect submissions, run deterministic comparisons, search Qdrant and request public-source candidates. Groq explanations are optional and gated by ALLOW_EXTERNAL_AI; neither the agent nor the model determines similarity or misconduct. The system presents matched passages, source links, method-specific scores and limitations for human review. Prototype checks are recorded separately from formal accuracy evaluation.

2. INTRODUCTION
Academic integrity matters to credible learning and assessment. Digital submissions make it easy to copy, share and transform text or code. Exact phrase matching can identify verbatim overlap, while paraphrasing, translation, reordered passages, formatting changes and renamed code identifiers can make manual review harder. Instructors also need to compare work against both the institution’s own submissions and relevant public web material.

This project focuses on a software workflow that brings those comparisons together. Lexical methods identify shared wording, semantic embeddings surface passages with related meaning, and code-specific normalisation helps reveal similarities hidden by superficial edits. Search results provide candidate public sources; retrieved page text is then compared with the submitted material. Each result should retain evidence and provenance so a reviewer can verify it.

Language models can help explain a match in plain language, but they can also produce unsupported claims. Therefore, any Groq-generated explanation is optional, grounded in the matched excerpts, and visibly separate from computed similarity evidence. The platform is decision support: a score or explanation is not proof of plagiarism and must not automatically trigger discipline.

3. PROBLEM STATEMENT AND OBJECTIVES
3.1 Problem statement
Manual comparison of assignments is time-consuming and inconsistent. Basic string matching misses some paraphrased material, while general semantic similarity may flag legitimate shared terminology or topic overlap. Code can be changed through formatting, comments and identifier renaming. Comparing only against files already uploaded also misses possible public web sources. A useful review tool must combine complementary methods, show traceable evidence and make its search coverage limits clear.

3.2 Objectives
To design and develop a software-only web platform for document and source-code similarity review.
To accept supported document and code formats, extract content safely and retain source provenance.
To compare each submission with selected submissions in the platform and with candidate public web sources returned by a search provider.
To implement lexical comparison using TF-IDF and cosine similarity, semantic comparison using Hugging Face sentence embeddings, and token-based source-code comparison.
To display matched passages, source URLs, method-specific scores and model/version details for reviewer verification.
To optionally use Groq to produce concise, evidence-grounded explanations without using it as the similarity scorer or decision-maker.
To store records securely, provide review status and generate downloadable reports.
To evaluate the system on labelled copied, paraphrased, unrelated and transformed-code examples using precision, recall and F1-score; report measured results only after testing.

4. SCOPE OF THE PROJECT
The project covers a software prototype for document and source-code submissions. It includes file validation and extraction, submission-to-submission comparison, public-web candidate search followed by content comparison, similarity evidence, an instructor-facing dashboard and report generation. Web coverage depends on search-provider access and the pages that can lawfully and technically be retrieved. Intended users are authorised instructors or reviewers.

4.1 Included in scope
PDF, DOCX, TXT and selected source-code formats, subject to implemented parser support.
Lexical document comparison with TF-IDF/cosine similarity and matched passages.
Semantic comparison using a Hugging Face sentence-embedding model.
Normalised token-based comparison for source code, with language support stated explicitly.
Comparison against other uploaded submissions and candidate public web pages surfaced by a search provider.
Optional Groq-generated explanations grounded in supplied match excerpts.
A dashboard, reviewer status, access controls and report export.

4.2 Outside current scope / future work
Automatic findings of misconduct, disciplinary decisions or claims that a score proves plagiarism.
Guaranteed coverage of the entire internet, paywalled pages or content blocked from retrieval.
Circumvention of website access controls, terms or copyright restrictions.
Guaranteed detection of every paraphrase, translation, generated text or code transformation.
A production-grade institution-wide deployment before security, privacy and performance validation.
Unverified accuracy, latency, search coverage or user-study results.

4.3 Assumptions and constraints
The prototype assumes a development computer, network access, supported input files and access to a search provider if web comparison is enabled. Hugging Face sentence-transformers embeddings currently run locally on CPU; model selection, hardware needs and licensing must be recorded. Hosted Hugging Face inference previously returned HTTP 402 due to exhausted credits, so submission text is not sent to that endpoint. Groq access is optional and gated by ALLOW_EXTERNAL_AI. Search results vary by provider and time, and retrieved pages may be incomplete or unavailable. Similarity thresholds require calibration on representative labelled data.

5. LITERATURE REVIEW / EXISTING SYSTEM
Plagiarism detection combines methods with different strengths. TF-IDF and cosine similarity provide an inexpensive lexical baseline and can help locate repeated wording, but they are sensitive to changed phrasing. Sentence embeddings represent semantic content and can identify related passages with different wording; general semantic similarity is not by itself evidence of copying. Source-code systems such as JPlag compare program tokens and help detect transformed code. Search engines can surface public candidate sources, but their indexes are incomplete and do not grant permission to retrieve or reuse page content. Language models can summarize provided evidence, but their generated text needs verification.

Existing approach | Strength | Limitation | Design response
TF-IDF + cosine similarity | Fast lexical baseline; can support passage matching | May miss paraphrases and common phrases may match | Pair with semantic comparison and show spans
Hugging Face sentence embeddings | Semantic representation that can be compared efficiently | Related meaning is not proof of copying; thresholds vary by model | Calibrate on labelled examples and show model identity
Token-based code comparison | Detects overlap after formatting and comment changes | May miss deeper structural transformations | Normalize carefully and document language support
Web search provider | Finds candidate public pages | Index coverage, rate limits and page access vary | Show provider, URL, retrieval date and coverage caveat
Groq language model | Can summarize evidence for a reviewer | Can hallucinate or overstate conclusions | Optional grounded explanation, separate from score

5.1 Research gap
Many tools focus on only one comparison source or one content type. This project’s contribution is a shared review workflow for documents and code that combines institutional submissions with candidate public web sources, preserves method-specific evidence, and optionally explains matches. The value and accuracy of this workflow must be established through evaluation; formal accuracy validation remains pending.

6. SYSTEM / METHODOLOGY
The software is organised as a Next.js web frontend and a FastAPI backend, with MongoDB Atlas for submission, result and review records and Qdrant for semantic vectors. The backend validates uploads, extracts and normalises content, compares eligible submissions, and calculates lexical, semantic or code similarity. Sentence-transformers embeddings are computed locally. For web comparison, the configured search integration returns candidate URLs; accessible page content is retrieved within provider and site rules, then compared with the submission. A PydanticAI review coordinator can invoke scoped tools for submission inspection, deterministic comparison, Qdrant retrieval and public-source candidate search. The dashboard displays evidence and lets an authorised reviewer record a decision. Optional Groq explanations are gated by ALLOW_EXTERNAL_AI and cannot alter computed scores or reviewer decisions.

Figure 1. Software architecture: Next.js frontend, FastAPI backend, search integration, MongoDB Atlas, Qdrant and reviewer.

6.1 Processing stages
Intake: accept supported document and code files, validate size/type, and record uploader and submission metadata.
Extraction: parse supported documents and source files; report extraction failures rather than silently omitting content.
Preprocessing: normalize Unicode and whitespace, segment text into passages, and tokenize code while preserving source offsets.
Internal comparison: compare eligible submissions using lexical and semantic document methods or code-token methods.
Web comparison: search for candidate public pages, retrieve permitted content, retain source URLs and retrieval timestamps, and compare the extracted content.
Review: show scores, matched spans, method/model versions and source provenance; mark every result as a review indicator.
Optional explanation: when ALLOW_EXTERNAL_AI permits it, ask Groq to summarize supplied evidence only; keep its response distinct from algorithmic scores and allow reviewers to ignore it.
Reporting: export selected evidence and reviewer status with a methodology and coverage note.

Figure 2. Submission-to-review workflow for internal and public-web comparisons.

6.2 Document and source-code similarity
For documents, text is extracted from supported files and divided into manageable passages. TF-IDF vectors and cosine similarity provide a lexical score. A Hugging Face sentence-embedding model encodes passages and compares them using cosine similarity to surface semantic matches. The interface keeps these scores separate and displays matched text where possible. Thresholds are selected using labelled validation examples. A high score indicates similarity under a method, not a probability of misconduct.

For code, comments and irrelevant whitespace may be removed, tokens are normalized, and token n-grams or fingerprints are compared. Identifier normalization can reveal simple renaming but must be conservative to avoid creating false matches. Supported programming languages and parser limitations must be disclosed. AST-based or specialized code models can be considered later.

For web sources, the system searches using selected text snippets or distinctive terms and compares the submission against retrieved candidate pages. A search result alone is not a match. The system records provider, URL, retrieval time and accessible excerpt; unavailable or blocked content is reported as such. It must follow provider terms, website access rules and applicable copyright requirements.

Figure 3. Parallel comparison paths for submitted documents, web candidates and source code.

6.3 Similarity result record
Field | Purpose
submission_id / comparison_id | Identifies the uploaded item and comparison pair
source_type | Internal submission or public web page
source_reference | Comparison submission ID or source URL
method | TF-IDF, embedding model identifier or code-token method
score | Method-specific similarity value, not misconduct probability
matched_spans | Text offsets or token ranges supporting review
model_version / threshold_version | Enables reproducibility
provider / retrieved_at | Provenance for public web results
created_at / review_status | Analysis timestamp and reviewer-managed status

6.4 Optional explanation generation
The PydanticAI review coordinator provides scoped tools for evidence inspection and deterministic workflows; it does not make review decisions. Optional Groq explanation calls are gated by ALLOW_EXTERNAL_AI and may receive only approved evidence excerpts. The model must not invent citations, infer intent, declare a student guilty or change the underlying score. The UI labels generated text as AI-generated and keeps it separate from computed evidence. Sensitive submissions should not be sent to a third-party model without an approved data-handling basis; the feature can remain disabled.

6.5 Result review and provenance
Each comparison must identify what was compared, which method produced the score, which model or configuration was used, and what exact excerpt supports the match. Reviewers can mark a result pending, reviewed, relevant or dismissed, while original machine outputs remain unchanged. A web match includes its source URL and retrieval date; if content could not be retrieved, the UI must not imply that it was fully checked.

Figure 4. Evidence record with method-specific result, matched excerpt, source reference and human review state.

6.6 Output and instructor review
The dashboard supports filtering by submission, comparison type, score range and review status. Selecting a result opens matched passages side by side and, for web results, a source link and retrieval date. PDF reports include the selected evidence, methods, model versions, source provenance, limitations and reviewer status. Interface language should say “similarity detected” or “review suggested,” not “plagiarism confirmed.”

7. TOOLS AND TECHNOLOGIES USED
Layer | Technology / tool | Role in implemented prototype
Frontend | Next.js, React, TypeScript | Upload flow, dashboard and review pages
Application API and analysis service | Python, FastAPI | Authenticated API, extraction orchestration and similarity analysis
Lexical comparison | scikit-learn TF-IDF and cosine similarity | Explainable lexical baseline
Semantic comparison | Local Hugging Face sentence-transformers model | CPU-computed embeddings for passage comparison
Code comparison | Tokenization, n-grams and optional language parsers | Normalized code overlap analysis
Web-source discovery | Search provider API or approved search integration | Candidate public pages and source metadata
Review coordinator / explanation | PydanticAI; optional Groq API gated by ALLOW_EXTERNAL_AI | Scoped review tools; optional evidence-grounded explanations
Metadata database | MongoDB Atlas | Submission metadata, results and review records
Vector database | Qdrant | Semantic vector storage and retrieval
File storage | Approved local or object storage | Uploaded files and permitted derived artifacts
Testing | Postman, labelled corpora and evaluation scripts | API and model evaluation
Reporting / deployment | PDF generation and selected hosting | Export and web application hosting

The technologies above reflect the implemented prototype as recorded in the project progress log. Groq remains optional, and public-web candidate search depends on the configured provider and access. Record actual library versions, model identifiers, search provider, API routes and deployment configuration before final submission. Cost and rate limits depend on selected services.

8. SOFTWARE REQUIREMENTS
A supported desktop operating system, current browser and network connection.
Node.js runtime and compatible Next.js/React/TypeScript toolchain for the frontend.
Python environment with FastAPI, Uvicorn, document parsers, scikit-learn, PydanticAI and sentence-transformers.
Local Hugging Face sentence-transformers model files, with model license and version recorded.
MongoDB Atlas for submission/result/review records and Qdrant for vector storage.
Optional Groq API access for explanations, gated by ALLOW_EXTERNAL_AI and configured server-side.
A search-provider integration for web candidate discovery; limits and terms documented.
Restricted MongoDB Atlas and Qdrant credentials and access rules.
Secure file storage, authentication, malware/type validation and retention controls.
Version control, API testing tools and labelled evaluation datasets.

8.1 Cost considerations
No physical prototype is required. Software cost depends on hosting, database/file storage, web-search access and whether embedding inference or Groq uses paid services. Open-source libraries and local inference may reduce recurring charges, but require suitable compute and maintenance. The team should prepare an itemised estimate after choosing providers; no verified project cost has been supplied.

9. DESIGN AND IMPLEMENTATION
9.1 Logical architecture
The Next.js browser frontend calls authenticated FastAPI routes. The backend validates files, stores submission/result/review metadata in MongoDB Atlas, computes local embeddings and stores semantic vectors in Qdrant. It extracts and preprocesses content, compares eligible submissions, and requests candidate web sources through the configured search integration. Results retain method, source and model provenance. The dashboard retrieves results and supports reviewer annotations. The PydanticAI coordinator can call scoped analysis and retrieval tools. Optional Groq explanations are gated by ALLOW_EXTERNAL_AI and cannot alter computed scores or reviewer status.

Figure 5. Logical deployment view of browser, application API, analysis service, search provider and database.

9.2 Conceptual data model
Submission records include owner/course context, file type, hash, storage reference and creation time. SimilarityResult records identify both compared items, source type, method, score, matched spans, model/configuration version and creation time. WebSource records retain provider, URL, retrieval time and permitted extracted excerpt. ReviewRecord captures the reviewer, status, notes and timestamp separately from model output. ExplanationRecord, if enabled, stores model name and generated text with a clear AI-generated label.

Figure 6. Conceptual data entities and their associations.

9.3 Suggested API boundaries
/api/submissions — POST/GET: upload, validate and list authorised submissions.
/api/analyses — POST/GET: queue or retrieve internal and web comparison jobs.
/api/results — GET/PATCH: retrieve evidence and update reviewer status.
/api/sources/search — POST: search for public candidate sources through configured provider.
/api/reports — POST/GET: generate or retrieve review reports.
/api/explanations — POST: optionally generate a grounded explanation for selected evidence.

These are proposed boundaries, not a claim that exact endpoints already exist. Actual routes, schemas, authentication and retention rules must match implementation.

9.4 Similarity scoring logic
For a pair of text passages A and B, TF-IDF represents term importance and cosine similarity measures lexical vector alignment:
cosine(A, B) = (A · B) / (||A|| ||B||)
For semantic comparison, selected Hugging Face embeddings are compared using cosine similarity. Code comparison uses normalized token sequences or fingerprints. Scores from different methods must remain distinguishable and thresholds must be calibrated per method. A retrieved web URL is a candidate source; the system compares accessible text rather than treating search rank as a plagiarism score.

9.5 Privacy and security controls
Require authenticated, role-based access for submissions, results and reports.
Validate file type and size, scan uploads where available, and store credentials outside frontend code.
Use HTTPS in deployed environments and restrict access to databases and storage.
Minimize retained content and apply an approved retention/deletion policy.
Do not send private submissions to external search or language-model services unless institutional approval and suitable data handling are in place.
Keep Groq optional; send only the minimum excerpts needed and identify its output as generated assistance.
Log reviewer actions without overwriting original analysis results.
Respect search-provider terms, website access controls and content licensing; retain source URL and retrieval date.

10. TESTING, RESULTS AND DISCUSSION
The progress log records an eight-test backend suite, a clean pip dependency check, a passing authenticated readiness check, and a live smoke comparison using two labeled synthetic documents. These checks demonstrate that selected prototype paths ran; they are not a formal accuracy evaluation. Precision, recall, F1-score, web-search coverage and usability results remain to be measured on a representative labeled dataset.

10.1 Test strategy
Unit tests: validate extraction, normalization, passage segmentation, similarity calculations, token processing and malformed file handling.
Integration tests: exercise upload-to-analysis, internal comparison, web search-to-retrieval, result storage and dashboard review.
Comparison evaluation: use labelled copied, paraphrased, unrelated and code-transformation pairs with a held-out test set.
Web evaluation: record candidate-source retrieval success, accessible-content rate, source attribution and limitations for a fixed query set.
Explanation review: check whether optional Groq text is supported by provided excerpts, avoids invented claims and remains separate from scores.
Security checks: verify unauthorized access denial, upload validation, secret handling and deletion/retention behavior.

10.2 Metrics
Precision, recall and F1-score should be reported for each method and content type using a clearly defined positive label. Report threshold, dataset composition, train/validation/test split and false-positive/false-negative examples. For web sourcing, report search-result retrieval coverage separately from similarity accuracy; public search coverage cannot be assumed complete. Latency and cost per analysis may also be measured. Any target values should be set by the team before testing; none are reported here as achieved.

10.3 Prototype checks and evaluation status
Module | Metric | Target | Measured result
Document lexical comparison | Smoke-test score on two labeled synthetic documents | N/A; integration check only | TF-IDF cosine similarity 0.964; not an accuracy metric
Document semantic comparison | Smoke-test score on two labeled synthetic documents | N/A; integration check only | Local embedding cosine similarity 0.883; not an accuracy metric
Backend routes and tools | Automated test suite | N/A; implementation checks | 8 tests passed, per progress log
Dependency consistency | pip check | Clean environment | Passed, per progress log
Document/code comparison | Precision / recall / F1 | Set before evaluation | Not measured; formal evaluation pending
Web candidate search | Retrieval coverage / accessible-page rate | Set for chosen provider | Not measured; formal evaluation pending
Optional explanations | Evidence support review | Define review rubric | Not measured; formal evaluation pending

10.4 Discussion and interpretation
Lexical methods can flag legitimate common wording, while semantic methods can identify related content that is not copied. Code normalization may miss sophisticated transformations or create false matches if it is too aggressive. Web search is bounded by provider indexes and page accessibility. Groq explanations may be inaccurate even when supplied evidence is correct, so reviewers must verify them against the source passages. The interface should make these limitations visible and allow reviewers to dismiss or annotate results.

10.5 Acceptance checklist
Supported file types are validated and extraction failures are explicit.
Internal comparisons show method, score and traceable evidence.
Web results include provider, URL, retrieval date and accessible matched excerpt.
Code results identify supported languages and comparison method.
Optional model explanations are grounded, labeled and can be disabled.
Unauthorized users cannot access submissions or reports.
Reviewer decisions are stored separately from model outputs.
No fabricated performance claims appear before evaluation.

11. CHALLENGES, LEARNING OUTCOMES, CONCLUSION AND FUTURE SCOPE
11.1 Engineering challenges
The main challenges are reliable extraction across file formats, balancing lexical and semantic methods, preserving code structure during normalization, managing search-provider limits, and protecting sensitive submissions. Model choice and thresholds affect results and need representative labelled data. External APIs add availability, privacy, cost and rate-limit constraints.

11.2 Learning outcomes
The project develops experience in NLP, sentence embeddings, source-code analysis, information retrieval, API design, database modelling, secure file handling, dashboard development and evaluation methodology. It emphasizes provenance, reproducibility and careful communication of uncertain AI outputs.

11.3 Conclusion
SourceLens is a software platform for comparing documents and source code against other submissions and candidate public web sources. It combines lexical, semantic and code-specific methods in an instructor-facing workflow that exposes evidence and provenance. Groq can optionally explain identified matches, while similarity scoring remains based on explicit comparison methods. The system is a review aid, not an automated misconduct judge. Formal performance claims require a representative evaluation; the recorded smoke scores are not accuracy results.

11.4 Future scope
Evaluate multilingual embedding models and specialized code-similarity or AST-based approaches.
Add more search providers or licensed corpora while preserving source provenance and usage rules.
Improve large-corpus indexing and incremental comparison performance.
Integrate with a learning management system after security and data-governance review.
Conduct formal privacy, security, bias and usability assessments before deployment.

12. PATENT / RESEARCH PAPER
12.1 Invention concept
The project concept is a software platform that combines lexical and semantic document comparison, source-code similarity analysis, internal submission matching and public-web candidate sourcing in one evidence-oriented review workflow. Optional language-model explanations are a separate reviewer aid.

12.2 Proposed elements for review
A shared evidence record for internal submissions and public web sources.
Parallel lexical and embedding-based passage comparison with visible method provenance.
Code token normalization and traceable matched regions.
Optional explanation generation constrained to retrieved evidence and separated from scores.

12.3 Disclosure and legal status
These elements describe the proposed system and do not establish novelty, non-obviousness or patentability. A professional prior-art search and review by an authorised patent professional are required. The supplied material does not establish a completed filing or patent status.

12.4 Research-paper status
No published paper or acceptance details were supplied. Add title, authors, venue, DOI or public link only after confirmation.

13. REFERENCES (IEEE FORMAT)
[1] T. Foltýnek, N. Meuschke, and B. Gipp, “Academic plagiarism detection: A systematic literature review,” ACM Computing Surveys, vol. 52, no. 6, pp. 112:1–112:42, 2019, doi: 10.1145/3345317.
[2] G. Salton and C. Buckley, “Term-weighting approaches in automatic text retrieval,” Information Processing & Management, vol. 24, no. 5, pp. 513–523, 1988.
[3] N. Reimers and I. Gurevych, “Sentence-BERT: Sentence embeddings using Siamese BERT-networks,” in Proc. EMNLP-IJCNLP, 2019, pp. 3982–3992, doi: 10.18653/v1/D19-1410.
[4] M. Potthast, B. Stein, A. Barrón-Cedeño, and P. Rosso, “An evaluation framework for plagiarism detection,” in Proc. 23rd International Conference on Computational Linguistics (COLING 2010): Posters, 2010.
[5] L. Prechelt, G. Malpohl, and M. Philippsen, “Finding plagiarisms among a set of programs with JPlag,” Journal of Universal Computer Science, vol. 8, no. 11, pp. 1016–1038, 2002.
[6] F. Pedregosa et al., “Scikit-learn: Machine learning in Python,” Journal of Machine Learning Research, vol. 12, pp. 2825–2830, 2011.
[7] Hugging Face, “Sentence Transformers documentation.” [Online]. Available: https://huggingface.co/docs/transformers
[8] Groq, “API documentation.” [Online]. Available: https://console.groq.com/docs

APPENDIX A. DATA DICTIONARY AND EVENT MAPPING
Entity | Field | Type / example | Notes
Submission | submission_id | String / UUID | Unique identifier
Submission | file_type | PDF, DOCX, TXT, source code | Supported and validated type
SimilarityResult | source_type | Internal / public web | Comparison provenance
SimilarityResult | method | TF-IDF / embedding / code token | Method used
SimilarityResult | score | Numeric | Method-specific; not probability of misconduct
SimilarityResult | matched_spans | Array / offsets | Evidence for reviewer
WebSource | URL / provider / retrieved_at | String / timestamp | Candidate source provenance
ExplanationRecord | model / generated_text | String | Optional Groq output, clearly labeled
ReviewRecord | review_status | pending / reviewed / relevant / dismissed | Human-assigned status

A.1 Evidence rules
Every comparison records the submission, comparison target, method, timestamp and configuration.
A public-web result records the search provider, URL, retrieval time and which content was accessible.
Do not imply a page was checked when its content could not be retrieved.
The interface distinguishes computed scores, generated explanations and reviewer conclusions.
Similarity is a prompt for review, not proof of cause or misconduct.

APPENDIX B. TEST PLAN AND REVIEW CHECKLIST
ID | Test case | Expected result | Status
T01 | Upload a supported PDF/DOCX/TXT document | Text extracted and submission ID recorded | To be executed
T02 | Upload unsupported or malformed file | Clear validation error; no corrupted record | To be executed
T03 | Compare identical text samples | High lexical similarity and traceable spans | To be measured
T04 | Compare paraphrased samples | Semantic path surfaces related meaning where supported | To be measured
T05 | Compare unrelated samples on same topic | Legitimate topical overlap is distinguishable in review | To be measured
T06 | Compare code with renamed identifiers | Normalized token path detects remaining overlap | To be measured
T07 | Search for a known public source | Candidate URL and retrieval metadata are recorded | To be measured
T08 | Candidate page is inaccessible | System reports unavailable content and does not claim full comparison | To be executed
T09 | Request explanation for a known match | Groq output references only provided evidence and is labeled | To be measured
T10 | Open report as unauthorized user | Access denied | To be executed
T11 | Disable Groq integration | Similarity analysis and review still function | To be executed

B.1 Submission readiness checklist
Confirm official department wording, mentor names and designations.
Record actual formats, software/library versions, embedding model and search provider.
Confirm data-handling approval before sending content to external services.
Insert measured metrics, test evidence and failure cases after evaluation.
Update the table of contents page numbers in Microsoft Word.
Attach an invention disclosure form only if requested.

APPENDIX C. DOCUMENT AND CODE PROCESSING NOTES
Document extraction should preserve page or paragraph offsets where the chosen parser supports them so that matched text can be traced to its source. The pipeline should report empty or partial extraction and avoid silently comparing incomplete files. Store file hashes to identify duplicate uploads and apply access controls to all originals and derived text.

Code processing should identify the language where supported, preserve token order, remove comments only when appropriate, and record the normalization policy. Identifier normalization can expose simple renaming but must not erase meaningful program structure. The report and UI should state when a file uses an unsupported language or falls back to generic tokenization.

Processing stage | Data produced | Handling note
Extraction | Text, page/paragraph offsets | Keep source provenance; report partial failures
Normalization | Canonical text or code tokens | Record transformation settings
Comparison | Scores and matched spans | Keep methods separate and reproducible
Web retrieval | URL, retrieved excerpt, timestamp | Respect provider and site rules
Explanation | Optional generated summary | Evidence-grounded, labeled and disableable

APPENDIX D. DASHBOARD AND REPORTING DESIGN PRINCIPLES
The dashboard should keep evidence central, with readable typography, aligned comparisons and restrained visual styling. Each result should show its timestamp, source type, comparison method, score and model/configuration where relevant. Explain in plain language what the method measured and its limits.

Selecting a result should show matched passages side by side. Web comparisons include a clickable source URL and retrieval date. Code comparisons show language and matched token regions where available. Reports include analysis methods, thresholds, source provenance, reviewer status and a note that the output is a review aid.

UI element | Required information | Design note
Comparison result | Score, method, submission pair | Keep lexical and semantic values distinct
Matched passage | Excerpts and offsets | Make source context inspectable
Web source | URL, provider, retrieval date | State coverage/access limitations
Code match | Language, token spans, method | Avoid claiming intent
Explanation | Model name and generated text | Label as optional AI output
PDF report | Evidence, methods, reviewer status | Include methodology note

APPENDIX E. RISK REGISTER
Risk | Potential impact | Mitigation / response
False positive similarity | Legitimate overlap flagged | Show passages, use multiple methods, tune thresholds and require review
False negative similarity | Relevant reuse not detected | Evaluate paraphrase and code transformation cases; document limits
Search coverage gaps | Public source not surfaced | State provider and coverage limits; report search configuration
Inaccessible source page | Incomplete comparison | Mark unavailable; never imply full page was checked
Generated explanation error | Reviewer misled by unsupported text | Ground in excerpts, label output, allow disable and verify
Privacy over-sharing | Submission content exposed to third party | Minimize data, obtain approval, restrict or disable external APIs
Unauthorized access | Sensitive submissions disclosed | Authentication, role-based access, secure storage and audit records
Unverified performance claims | Report overstates project maturity | Report only measured results and retain evaluation evidence

E.1 Final note
This report documents SourceLens, a software-based document and source-code similarity review platform. The progress log records a working Next.js/FastAPI prototype with MongoDB Atlas, Qdrant, local Hugging Face sentence-transformers embeddings and an optional PydanticAI/Groq workflow. Recorded smoke-test scores and backend checks are implementation evidence, not formal accuracy results. Representative evaluation remains necessary before making performance claims.
