// How many days ahead of a license/policy expiry date the notification
// engine flags it as "expiring soon". Configurable — not a statutory value.
const LICENSE_EXPIRY_WINDOW_DAYS = 30;

// The BOCW Act's continuous-employment threshold for the 90-Days Form.
const COMPLIANCE_90_DAY_THRESHOLD = 90;

module.exports = { LICENSE_EXPIRY_WINDOW_DAYS, COMPLIANCE_90_DAY_THRESHOLD };
