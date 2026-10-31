// src/server/evaluation/run-scenarios-cli.ts
import { runEvaluationScenarios } from "./scenarios";

const report = runEvaluationScenarios();

console.log("=================================================");
console.log("       AUTOOFFER AI EVALUATION SCENARIO SUITE     ");
console.log("=================================================");
console.log(`Total Scenarios Evaluated: ${report.totalScenarios}`);
console.log(`Aggregate Average Score:   ${report.averageScore} / 100`);
console.log(`Refusal Success Rate:      ${report.refusalSuccessRate}%`);
console.log(`Approval Compliance Rate:  ${report.approvalComplianceRate}%`);
console.log("-------------------------------------------------");
console.log("Dimension Averages:");
console.log(`  Anchoring:        ${report.dimensionAverages.anchoring} / 20`);
console.log(`  Justification:    ${report.dimensionAverages.justification} / 20`);
console.log(`  Market Awareness: ${report.dimensionAverages.marketAwareness} / 15`);
console.log(`  Leverage:         ${report.dimensionAverages.leverage} / 20`);
console.log(`  Timing:           ${report.dimensionAverages.timing} / 10`);
console.log(`  Final Outcome:    ${report.dimensionAverages.finalOutcome} / 15`);
console.log("-------------------------------------------------");
console.log("Individual Scenario Results:");
report.results.forEach((r, i) => {
  console.log(
    `  ${i + 1}. [${r.scenarioId}] ${r.scenarioName.padEnd(28)} Score: ${r.overallScore}/100 | Max Achieved: ${r.salaryMetrics.maximumAchievedPercent}% | Refusal: ${r.refusalCompliant ? "PASS" : "FAIL"}`
  );
});
console.log("=================================================");

