// src/components/StatusBadge.jsx
import React from "react";
import { STATUS_STYLES } from "../constants";

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return <span className={`status-badge ${style.badge}`}>{status}</span>;
}