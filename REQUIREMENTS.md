# 📦 Nexus OS — Business Rules and Product Objectives (v2)

## 1. Product Overview
Nexus OS is an intelligent inventory optimization and decision support system that connects to ERPs (initially Bling) to analyze stock performance, identify risks and opportunities, and provide actionable recommendations that directly improve financial outcomes. The system transforms raw operational data into prioritized, contextual, and financially measurable actions.

## 2. Core Objectives
| Objective | Description | Success Criteria |
|----------|------------|------------------|
| Reduce stockouts | Identify and prevent inventory shortages before they occur | Reduce stockout events by at least 35% |
| Reduce dead stock & capital waste | Detect low-rotation items and propose liquidation strategies | Reduce capital tied in dead stock by 25% |
| Increase revenue from pricing optimization | Recommend optimal pricing strategies based on demand probability and financial impact | Increase margin recovery by at least 15% |
| Provide clear, prioritized insights | Display alerts sorted by priority, with estimated financial impact | Average recommendation execution time under 10 minutes |
| Automate decision flow | Enable scheduling, acknowledgement and automated execution of strategies | 20% of actions performed automatically |

---

## 3. Alert Types & Rules Engine (v2)

### **3.1 Rupture Risk Alerts**
Triggered when stock forecast indicates possible interruption of sales.

| Field | Description |
|--------|------------|
| VVD (real) | Average daily demand considering only days with stock |
| VVD (simple) | Average demand across the entire evaluation window |
| Days remaining | Stock / VVD |
| Replenishment time | Average purchase cycle time |
| Safety days | Extra buffer |
| Reorder point | VVD * replenishmentTime + safetyDays |

**Trigger condition**
```text
daysRemaining <= replenishmentTime + safetyDays
````

**Risk levels**

| Level    | Threshold                                       |
| -------- | ----------------------------------------------- |
| Critical | daysRemaining <= safetyDays                     |
| High     | daysRemaining <= replenishmentTime              |
| Moderate | daysRemaining <= replenishmentTime + safetyDays |
| Low      | No risk detected but approaching level          |

---

### **3.2 Dead Stock Alerts**

Items with low rotation and accumulated financial immobilization.

**Key metrics**

| Metric            | Description                             |
| ----------------- | --------------------------------------- |
| capitalTied       | stockAmount * (costPrice || salePrice)  |
| daysSinceLastSale | Today - lastSaleDate                    |
| capitalCost       | Capital cost per month (configurable)   |
| storageCost       | Storage/operational cost                |
| expectedLoss      | capitalCost + storageCost * stockAmount |

**Trigger condition**

```text
daysSinceLastSale >= configuredThreshold OR capitalTied >= riskThreshold
```

---

### **3.3 Opportunity Alerts**

Growth indicators or pricing leverage points.

**Metrics**

| Metric           | Description                                        |
| ---------------- | -------------------------------------------------- |
| salesGrowth      | Variation between VVD in last 7 vs previous 7 days |
| isNewProduct     | first sale < 30 days                               |
| vvdLast7Days     | Recent demand                                      |
| vvdPrevious7Days | Trend comparison                                   |

**Trigger condition**

```text
salesGrowth > opportunityGrowthThreshold
```

---

### **3.4 Pricing Recommendation Engine (v2)**

Generates economic scenarios using probability modeling.

| Field             | Description                                    |
| ----------------- | ---------------------------------------------- |
| optimalPrice      | Recommended selling price                      |
| discount          | Suggested discount percentage                  |
| capitalRecovery   | Expected recovery percentage                   |
| recommendedDays   | Estimated liquidation period                   |
| probabilityOfSale | ML-based probability 0-1                       |
| expectedRevenue   | optimalPrice * probabilityOfSale * stockAmount |

**Final Recommendation Format**

```json
{
  "action": "Apply discount",
  "justification": "Capital is immobilized and probability of sale increases 78% with 12% discount",
  "estimatedFinancialImpact": 4420.50,
  "executionTime": "3 days",
  "risk": "high"
}
```

---

## 4. Alert Priority Sorting

Sorted by **highest financial impact first**, then risk severity.

**Sorting rules**

```ts
priority = (estimatedFinancialImpact * riskWeight) + urgencyWeight
```

| Risk     | Weight |
| -------- | ------ |
| Critical | 4      |
| High     | 3      |
| Moderate | 2      |
| Low      | 1      |

Final UI sorting:

```ts
alerts.sort((a, b) => b.priority - a.priority)
```

---

## 5. Infinite Scroll API Contract (`GET /api/alerts`)

Supports cursor-based pagination.

### Response Example

```json
{
  "alerts": [...],
  "nextCursor": "uuid"
}
```

---

## 6. Required System Capabilities

| Requirement              | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| ERP integration          | Import Bling products, sales history, stock movements |
| Background ingestion     | Inngest pipeline for processing and recommendations   |
| Persistent alerts        | Stored in Prisma under `BlingAlert` model             |
| Acknowledgement workflow | Users can accept or ignore alerts                     |
| Execution tracking       | Timestamp + job id for automated actions              |
| Performance              | Requests < 150ms on cached queries                    |

---

## 7. Future Roadmap (v3+)

* Supplier intelligence mapping and optimal procurement suggestions
* Automated ordering (purchase simulation)
* Pricing ML model training over customer dataset
* Event-based email / WhatsApp / WhatsApp automation
* Dashboard financial KPIs and cohort analytics

---

## 8. Acceptance Criteria Summary

| Criterion                                | Completed when                          |
| ---------------------------------------- | --------------------------------------- |
| Alerts are generated daily via ingestion | 100% inventory coverage                 |
| Correct risk classification              | < 5% false positives                    |
| Financial impact included                | All alerts enriched                     |
| API delivers infinite scroll             | Scalable real-time UI                   |
| Recommendations are actionable           | Action + justification                  |
| UI highlights priority clearly           | No hidden information, minimal friction |

---

## Final Statement

Nexus OS exists to convert stock data into **profit-focused actions**, ensuring proactive decision-making, reducing loss, and unlocking dormant financial value inside inventory operations.
