<section>
  <h1>VDC Demonstration – Non-GxP Verification &amp; Test Evidence</h1>

  <div style="border:1px solid rgba(255,255,255,0.25); padding:14px 16px; border-radius:10px; margin:14px 0;">
    <strong>Important Demonstration Disclaimer</strong><br><br>
    This environment is a <strong>non-GxP demonstration instance</strong> provided for illustrative and educational purposes only.<br>
    It is <strong>not a validated production system</strong> and must <strong>not</strong> be used to support regulated decision-making, product release, or GxP-governed records.<br>
    The workflows, controls, and evidence artifacts shown here are intentionally designed to <strong>demonstrate alignment with GxP and 21 CFR Part 11 expectations</strong>, but
    <strong>formal validation (IQ/OQ/PQ) applies only to a customer-specific production implementation</strong>.
  </div>

  <h2>Purpose</h2>
  <p>
    This section summarizes verification and test activities executed against the <strong>VDC demonstration environment</strong>
    to confirm end-to-end workflow behavior, role separation, audit trail integrity, and evidence capture.
  </p>
  <p>
    While this environment is <strong>not validated</strong>, the testing approach mirrors industry-standard IQ/OQ/PQ thinking
    to demonstrate how the system <strong>would be validated in a regulated deployment</strong>.
  </p>

  <hr style="opacity:0.25; margin:18px 0;">

  <h2>Summary of Verification Activities</h2>

  <h3>Installation Qualification (IQ) – Demonstration Context</h3>
  <ul>
    <li>Environment provisioned using AWS-native services (API Gateway, Lambda, DynamoDB, S3)</li>
    <li>Environment configuration captured via infrastructure-as-code (where applicable)</li>
    <li>Controlled document storage with versioning enabled</li>
    <li>Logical environment segregation (Non-GxP demo vs future GxP-aligned production)</li>
  </ul>
  <p><strong>Purpose:</strong> Demonstrate repeatable, inspectable system setup — not formal installation qualification.</p>

  <h3>Operational Qualification (OQ) – Workflow Verification</h3>
  <p>Verified through automated and manual checks:</p>
  <ul>
    <li>Role-based access enforcement (Submitter vs Approver)</li>
    <li>Controlled document submission and metadata capture</li>
    <li>Approval and rejection state transitions</li>
    <li>Enforcement of approval prerequisites (must be SUBMITTED before approve/reject)</li>
    <li>Download restrictions based on role (Approver-only download)</li>
    <li>Audit trail generation for critical actions (submit, approve, reject, download)</li>
  </ul>
  <p><strong>Evidence:</strong> API-level smoke tests (PowerShell), UI verification, and persisted audit events.</p>

  <h3>Performance / Process Qualification (PQ) – End-to-End Scenarios</h3>
  <p>Representative user workflows executed:</p>
  <ul>
    <li>Submit → Review → Approve</li>
    <li>Submit → Review → Reject with comment</li>
    <li>Multi-document queue handling (Pending Approvals)</li>
    <li>Audit trail inspection post-approval and post-rejection</li>
  </ul>
  <p><strong>Outcome:</strong> Workflow behaves as intended under realistic usage scenarios.</p>

  <hr style="opacity:0.25; margin:18px 0;">

  <h2>Audit Trail Transparency</h2>
  <p>All workflow actions generate <strong>append-only audit trail entries</strong>, including:</p>
  <ul>
    <li>Actor identity and role</li>
    <li>Timestamp (UTC)</li>
    <li>Action type (submit, approve, reject, download)</li>
    <li>Document integrity metadata (S3 object references, hash values)</li>
  </ul>
  <p>
    These records are retained to <strong>demonstrate inspection readiness and traceability</strong>,
    even within this non-GxP demonstration environment.
  </p>

  <h2>Notes on Demonstration Roles</h2>
  <ul>
    <li><strong>Submitter</strong> uploads and submits documents.</li>
    <li><strong>Approver</strong> reviews and completes approval/rejection with e-signature attestation.</li>
  </ul>
  <p>
    In the demonstration workflow, users may need to <strong>switch roles</strong> to observe both sides of the workflow.
  </p>

  <h2>Conclusion</h2>
  <p>
    This demonstration environment is intended to help stakeholders <strong>visually and technically understand how a GxP-aligned VDC solution operates on AWS</strong>,
    and how formal validation artifacts would be generated and maintained in a regulated production deployment.
  </p>
</section>